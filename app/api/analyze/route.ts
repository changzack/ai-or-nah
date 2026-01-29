import { NextResponse } from "next/server";
import { analyzeAccount } from "@/lib/analyze";
import { parseInstagramUsername } from "@/lib/username";
import { getCachedResult, updateResultAccess } from "@/lib/db/results";
import { getResultImages } from "@/lib/db/images";
import { getSession } from "@/lib/auth/session";
import { getCustomerById, deductCredit } from "@/lib/db/customers";
import {
  getOrCreateDevice,
  hasFreeChecks,
  incrementDeviceChecks,
  getFreeChecksRemaining,
} from "@/lib/db/fingerprints";
import type { AnalysisResult, PaywallResponse } from "@/lib/types";

/**
 * Main analysis endpoint
 * POST /api/analyze
 * Body: { "username": "instagram_username", "fingerprint"?: string, "deviceToken"?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username: rawUsername, fingerprint, deviceToken } = body;

    if (!rawUsername) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_username",
          message: "Please provide a username",
        },
        { status: 400 }
      );
    }

    // Parse and validate username
    const username = parseInstagramUsername(rawUsername);

    if (!username) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_username",
          message: "Invalid Instagram username or URL. Try again.",
        },
        { status: 400 }
      );
    }

    console.log(`[API] Checking cache for: ${username}`);

    // Step 1: Check if user has access (credits or free checks) BEFORE anything else
    const session = await getSession();
    let customerId: string | null = null;
    let shouldDeductCredit = false;
    let shouldDeductFreeCheck = false;

    if (session) {
      // Authenticated user - check credits
      const customer = await getCustomerById(session.customerId);
      if (!customer || customer.credits <= 0) {
        const paywallResponse: PaywallResponse = {
          status: "paywall",
          creditsRemaining: customer?.credits || 0,
          message: "You're out of credits. Purchase more to continue checking accounts.",
        };
        return NextResponse.json(paywallResponse, { status: 402 });
      }
      customerId = customer.id;
      shouldDeductCredit = true;
    } else {
      // Anonymous user - check free tier
      if (!fingerprint) {
        return NextResponse.json(
          {
            status: "error",
            error: "missing_fingerprint",
            message: "Device fingerprint required",
          },
          { status: 400 }
        );
      }

      const hasFree = await hasFreeChecks(deviceToken || null, fingerprint);
      if (!hasFree) {
        const paywallResponse: PaywallResponse = {
          status: "paywall",
          freeChecksUsed: 3,
          message: "You've used all your free checks. Purchase credits to continue.",
        };
        return NextResponse.json(paywallResponse, { status: 402 });
      }
      shouldDeductFreeCheck = true;
    }

    // Step 2: Check cache (but still deduct credit/check)
    const cachedResult = await getCachedResult(username);

    if (cachedResult) {
      console.log(`[API] ✓ Cache hit for ${username} (last checked: ${cachedResult.checked_at})`);

      // Deduct credit/free check even for cached results
      let creditsRemaining: number | undefined;
      let freeChecksRemaining: number | undefined;

      if (shouldDeductCredit && customerId) {
        console.log("[API] Deducting credit for cached result...");
        const deducted = await deductCredit(customerId, cachedResult.id);
        if (!deducted) {
          console.warn("[API] Failed to deduct credit for cached result");
        } else {
          console.log("[API] ✓ Credit deducted successfully");
        }
        // Get updated credits balance
        const customer = await getCustomerById(customerId);
        creditsRemaining = customer?.credits;
        console.log("[API] Updated credits balance:", creditsRemaining);
      } else if (shouldDeductFreeCheck && fingerprint) {
        await incrementDeviceChecks(deviceToken || null, fingerprint);
        // Get remaining free checks after increment
        freeChecksRemaining = await getFreeChecksRemaining(deviceToken || null, fingerprint);
      }

      // Update access timestamp and view count
      await updateResultAccess(cachedResult.id);

      // Get stored image URLs
      const images = await getResultImages(cachedResult.id);
      const imageUrls = images.map((img) => img.image_url);

      // Return cached result
      const result: AnalysisResult = {
        status: "success",
        username: cachedResult.username,
        aiLikelihood: cachedResult.ai_likelihood_score,
        verdict: cachedResult.verdict,
        imageAnalysis: {
          score: cachedResult.image_analysis_score,
          count: cachedResult.images_analyzed_count,
          message: getImageAnalysisMessage(cachedResult.image_analysis_score),
        },
        profileFlags: cachedResult.profile_flags as any[],
        consistencyFlags: cachedResult.consistency_flags as any[],
        imageUrls,
        checkedAt: cachedResult.checked_at,
        lastAccessedAt: new Date().toISOString(),
        isCached: true,
        freeChecksRemaining,
        creditsRemaining,
      };

      console.log(`[API] Returning cached result - freeChecks: ${freeChecksRemaining}, credits: ${creditsRemaining}`);
      return NextResponse.json(result);
    }

    console.log(`[API] ✗ Cache miss for ${username}, running fresh analysis`);

    // Step 3: Run fresh analysis (access already verified above)
    const result = await analyzeAccount(username);

    if (result.status === "error") {
      // Don't deduct on error
      return NextResponse.json(result, { status: 404 });
    }

    // Step 4: Deduct credit/free check ONLY on success (not on error)
    let freeChecksRemaining: number | undefined;
    let creditsRemaining: number | undefined;

    if (shouldDeductCredit && customerId) {
      // Deduct credit for authenticated user
      console.log("[API] Deducting credit for fresh result...");
      const deducted = await deductCredit(customerId);
      if (!deducted) {
        console.warn("[API] Failed to deduct credit, but analysis succeeded");
      } else {
        console.log("[API] ✓ Credit deducted successfully");
      }
      // Get updated credits balance
      const customer = await getCustomerById(customerId);
      creditsRemaining = customer?.credits;
      console.log("[API] Updated credits balance:", creditsRemaining);
    } else if (shouldDeductFreeCheck && fingerprint) {
      // Increment free check count for anonymous user
      await incrementDeviceChecks(deviceToken || null, fingerprint);
      // Get remaining free checks after increment
      freeChecksRemaining = await getFreeChecksRemaining(deviceToken || null, fingerprint);
    }

    // Add remaining checks/credits info to response
    const resultWithChecks = {
      ...result,
      freeChecksRemaining,
      creditsRemaining,
    };

    console.log(`[API] Returning fresh result - freeChecks: ${freeChecksRemaining}, credits: ${creditsRemaining}`);
    return NextResponse.json(resultWithChecks);
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "analysis_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper to get image analysis message (duplicated from constants to avoid circular imports)
function getImageAnalysisMessage(score: number): string {
  if (score < 0.3) return "The faces in these photos look pretty natural to me.";
  if (score < 0.6) return "Some of these photos have that AI-generated vibe, but it's hard to say for sure.";
  if (score < 0.8) return "Most of these faces have telltale signs of AI generation.";
  return "These photos are almost certainly AI-generated. The patterns are unmistakable.";
}
