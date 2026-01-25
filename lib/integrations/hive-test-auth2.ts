/**
 * Test additional Hive API authentication variations
 * Based on finding that "Token" auth is required but credentials are invalid
 */

const HIVE_API_ENDPOINT = "https://api.thehive.ai/api/v2/task/sync";
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
 * Method 7: Token with secret key (instead of access key)
 */
async function testMethod7(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_API_ENDPOINT, {
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
      method: "Token with secretKey",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Token with secretKey",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 8: Token with combined key:secret format
 */
async function testMethod8(): Promise<TestResult> {
  try {
    const combinedToken = `${apiKeyId}:${secretKey}`;
    const response = await fetch(HIVE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${combinedToken}`,
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
      method: "Token with combined key:secret",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Token with combined key:secret",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 9: Token auth with user_id and api_key
 */
async function testMethod9(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKeyId}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        classes: ["ai_generated"],
        user_id: apiKeyId,
        api_key: secretKey,
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
      method: "Token with user_id and api_key in body",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Token with user_id and api_key in body",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 10: Just api_key and user_id in body, no auth header
 */
async function testMethod10(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        classes: ["ai_generated"],
        user_id: apiKeyId,
        api_key: secretKey,
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
      method: "user_id and api_key in body only",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "user_id and api_key in body only",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run additional test methods
 */
export async function testAdditionalAuthMethods(): Promise<TestResult[]> {
  console.log("🔐 Testing Additional Hive API Authentication Methods...\n");

  const results: TestResult[] = [];

  results.push(await testMethod7());
  results.push(await testMethod8());
  results.push(await testMethod9());
  results.push(await testMethod10());

  return results;
}
