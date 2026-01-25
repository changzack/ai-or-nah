/**
 * Final v3 API tests with Bearer auth variations
 */

const HIVE_V3_ENDPOINT = "https://api.thehive.ai/api/v3/task/sync";
const TEST_IMAGE_URL = "https://picsum.photos/400/400";

const apiKeyId = "Hoxo9Qhy8x94qG4y";
const secretKey = "AVZtSMreWHRLlECYDlcbdA==";

interface TestResult {
  method: string;
  status: number;
  success: boolean;
  response?: any;
  error?: string;
}

/**
 * Test: Bearer with secretKey
 */
async function testBearerSecret(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        classes: ["ai_generated"],
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      method: "Bearer with secretKey",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Bearer with secretKey",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test: Bearer with apiKeyId (retry for comparison)
 */
async function testBearerApiKey(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKeyId}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        classes: ["ai_generated"],
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      method: "Bearer with apiKeyId",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Bearer with apiKeyId",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test: Bearer with combined token
 */
async function testBearerCombined(): Promise<TestResult> {
  try {
    const combinedToken = `${apiKeyId}.${secretKey}`;
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${combinedToken}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        classes: ["ai_generated"],
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      method: "Bearer with apiKeyId.secretKey",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Bearer with apiKeyId.secretKey",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run final tests
 */
export async function testFinalV3Methods(): Promise<TestResult[]> {
  console.log("🔐 Final Hive v3 Bearer Auth Tests...\n");

  const results: TestResult[] = [];

  results.push(await testBearerSecret());
  results.push(await testBearerApiKey());
  results.push(await testBearerCombined());

  return results;
}
