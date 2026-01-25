import { NextResponse } from "next/server";
import { testV3AuthMethods } from "@/lib/integrations/hive-test-v3";

/**
 * Test Hive v3 API authentication
 * GET /api/test-hive-v3
 */
export async function GET() {
  try {
    console.log("Testing Hive v3 API authentication...");

    const results = await testV3AuthMethods();

    // Find successful method
    const successfulMethod = results.find((r) => r.success);

    if (successfulMethod) {
      console.log(`✅ SUCCESS! Method: ${successfulMethod.method}`);
    }

    return NextResponse.json({
      success: !!successfulMethod,
      successfulMethod: successfulMethod?.method || null,
      workingResponse: successfulMethod?.response || null,
      allResults: results.map((r) => ({
        method: r.method,
        status: r.status,
        success: r.success,
        error: r.error,
        responsePreview: r.success
          ? "✅ SUCCESS!"
          : typeof r.response === "string"
          ? r.response.substring(0, 200)
          : JSON.stringify(r.response).substring(0, 200),
      })),
    });
  } catch (error) {
    console.error("Error testing v3 auth methods:", error);
    return NextResponse.json(
      {
        error: "Failed to test v3 authentication methods",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
