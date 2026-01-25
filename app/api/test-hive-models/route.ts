import { NextResponse } from "next/server";
import { testModelSpecifications } from "@/lib/integrations/hive-test-models";

/**
 * Test Hive v3 API with different model specifications
 * GET /api/test-hive-models
 */
export async function GET() {
  try {
    console.log("Testing model specifications...");

    const results = await testModelSpecifications();
    const successfulMethod = results.find((r) => r.success);

    if (successfulMethod) {
      console.log(`✅ SUCCESS! ${successfulMethod.method}`);
      console.log("Response:", JSON.stringify(successfulMethod.response, null, 2));
    }

    return NextResponse.json({
      success: !!successfulMethod,
      successfulMethod: successfulMethod?.method || null,
      workingResponse: successfulMethod?.response || null,
      summary: results.map((r) => ({
        method: r.method,
        status: r.status,
        result: r.success ? "✅ SUCCESS!" : `❌ ${r.response?.message || "Failed"}`,
      })),
      allResults: results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
