/**
 * Test Hive v3 API authentication
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
 * Test v3 with Token auth (apiKeyId)
 */
async function testV3Method1(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKeyId}`,
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
      method: "v3: Token with apiKeyId",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "v3: Token with apiKeyId",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test v3 with Token auth (secretKey)
 */
async function testV3Method2(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${secretKey}`,
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
      method: "v3: Token with secretKey",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "v3: Token with secretKey",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test v3 with Bearer auth (apiKeyId)
 */
async function testV3Method3(): Promise<TestResult> {
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
      method: "v3: Bearer with apiKeyId",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "v3: Bearer with apiKeyId",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test v3 with Basic Auth
 */
async function testV3Method4(): Promise<TestResult> {
  try {
    const authString = `${apiKeyId}:${secretKey}`;
    const authToken = Buffer.from(authString).toString("base64");

    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
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
      method: "v3: Basic Auth (apiKeyId:secretKey)",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "v3: Basic Auth (apiKeyId:secretKey)",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run all v3 test methods
 */
export async function testV3AuthMethods(): Promise<TestResult[]> {
  console.log("🔐 Testing Hive v3 API Authentication Methods...\n");

  const results: TestResult[] = [];

  results.push(await testV3Method1());
  results.push(await testV3Method2());
  results.push(await testV3Method3());
  results.push(await testV3Method4());

  return results;
}
