import type { Metadata } from "next";
import type { AnalysisResult } from "@/lib/types";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  // Fetch cached result directly from database for metadata
  // This is more reliable than HTTP fetch and runs server-side
  let aiLikelihood: number | null = null;
  let verdict = "unclear";
  let hasResult = false;

  try {
    const supabase = createServerClient();

    // Query the database directly for the cached result
    const { data: cachedResult, error } = await supabase
      .from("results")
      .select("ai_likelihood, verdict")
      .eq("username", username.toLowerCase())
      .single();

    if (!error && cachedResult) {
      aiLikelihood = cachedResult.ai_likelihood;
      verdict = cachedResult.verdict;
      hasResult = true;
      console.log(`[Metadata] Found cached result for @${username}: ${aiLikelihood}% (${verdict})`);
    } else {
      console.log(`[Metadata] No cached result found for @${username}`);
    }
  } catch (err) {
    console.error("[Metadata] Error fetching cached result:", err);
  }

  // Generate title and description based on whether we have a result
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = `${siteUrl}/check/${username}`;

  let title: string;
  let description: string;

  if (hasResult && aiLikelihood !== null) {
    title = `🤖 @${username}: ${aiLikelihood}% Likely AI - AI or Nah`;
    description = `I checked @${username} with AI or Nah. ${aiLikelihood}% likely AI. See the full breakdown.`;
  } else {
    // Generic fallback for profiles not yet checked
    title = `AI or Nah - Check if @${username} is real or AI`;
    description = `Use AI detection to analyze @${username}'s Instagram profile. See if those photos are real or AI-generated.`;
  }

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "AI or Nah",
      type: "website",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og-image.png`],
    },
  };
}

export default function CheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
