/**
 * Test different Hive API authentication methods
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
 * Method 1: API Key as Bearer token
 */
async function testMethod1(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_API_ENDPOINT, {
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
      method: "Bearer token (apiKeyId)",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Bearer token (apiKeyId)",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 2: API Key as Token
 */
async function testMethod2(): Promise<TestResult> {
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
      method: "Token with api_key in body",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Token with api_key in body",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 3: Basic Auth (base64)
 */
async function testMethod3(): Promise<TestResult> {
  try {
    const authString = `${apiKeyId}:${secretKey}`;
    const authToken = Buffer.from(authString).toString("base64");

    const response = await fetch(HIVE_API_ENDPOINT, {
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
      method: "Basic Auth (base64)",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "Basic Auth (base64)",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 4: API key in query params
 */
async function testMethod4(): Promise<TestResult> {
  try {
    const url = `${HIVE_API_ENDPOINT}?api_key=${apiKeyId}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      method: "API key in query params",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "API key in query params",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 5: X-API-Key header
 */
async function testMethod5(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKeyId,
        "X-API-Secret": secretKey,
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
      method: "X-API-Key and X-API-Secret headers",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "X-API-Key and X-API-Secret headers",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 6: api_token in body
 */
async function testMethod6(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        classes: ["ai_generated"],
        api_token: apiKeyId,
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
      method: "api_token in body",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "api_token in body",
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run all test methods
 */
export async function testAllAuthMethods(): Promise<TestResult[]> {
  console.log("🔐 Testing Hive API Authentication Methods...\n");

  const results: TestResult[] = [];

  // Run all tests
  results.push(await testMethod1());
  results.push(await testMethod2());
  results.push(await testMethod3());
  results.push(await testMethod4());
  results.push(await testMethod5());
  results.push(await testMethod6());

  return results;
}
