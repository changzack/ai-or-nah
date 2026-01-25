import { NextResponse } from "next/server";
import { testAllAuthMethods } from "@/lib/integrations/hive-test-auth";

/**
 * Test different Hive API authentication methods
 * GET /api/test-hive-auth
 */
export async function GET() {
  try {
    console.log("Starting Hive API authentication tests...");

    const results = await testAllAuthMethods();

    // Find successful method
    const successfulMethod = results.find((r) => r.success);

    return NextResponse.json({
      success: !!successfulMethod,
      successfulMethod: successfulMethod?.method || null,
      allResults: results.map((r) => ({
        method: r.method,
        status: r.status,
        success: r.success,
        error: r.error,
        responsePreview: r.success
          ? "Success! ✅"
          : typeof r.response === "string"
          ? r.response.substring(0, 200)
          : JSON.stringify(r.response).substring(0, 200),
      })),
    });
  } catch (error) {
    console.error("Error testing auth methods:", error);
    return NextResponse.json(
      {
        error: "Failed to test authentication methods",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
