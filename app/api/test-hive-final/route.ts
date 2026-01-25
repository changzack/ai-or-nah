import { NextResponse } from "next/server";
import { testFinalV3Methods } from "@/lib/integrations/hive-test-v3-final";

/**
 * Final Hive v3 API authentication tests
 * GET /api/test-hive-final
 */
export async function GET() {
  try {
    console.log("Running final v3 auth tests...");

    const results = await testFinalV3Methods();

    const successfulMethod = results.find((r) => r.success);

    if (successfulMethod) {
      console.log(`🎉 SUCCESS! Working method: ${successfulMethod.method}`);
    }

    return NextResponse.json({
      success: !!successfulMethod,
      successfulMethod: successfulMethod?.method || null,
      successfulResponse: successfulMethod?.response || null,
      summary: results.map((r) => ({
        method: r.method,
        status: r.status,
        success: r.success ? "✅ WORKS!" : "❌ Failed",
        message: r.success
          ? "Authentication successful!"
          : typeof r.response === "object"
          ? r.response?.message || JSON.stringify(r.response).substring(0, 100)
          : r.response?.substring(0, 100) || r.error,
      })),
      allResults: results,
    });
  } catch (error) {
    console.error("Error in final tests:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
