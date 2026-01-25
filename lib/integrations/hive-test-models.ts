/**
 * Test Hive v3 API with different model specifications
 * We know Bearer with secretKey works, now testing model formats
 */

const HIVE_V3_ENDPOINT = "https://api.thehive.ai/api/v3/task/sync";
const TEST_IMAGE_URL = "https://picsum.photos/400/400";
const secretKey = "AVZtSMreWHRLlECYDlcbdA==";

interface TestResult {
  method: string;
  status: number;
  success: boolean;
  response?: any;
}

/**
 * Test with model_name in body
 */
async function testWithModelName(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        model_name: "ai-generated-content",
        classes: ["ai_generated"],
      }),
    });

    const data = await response.json();

    return {
      method: "With model_name: ai-generated-content",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "With model_name: ai-generated-content",
      status: 0,
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test with models array
 */
async function testWithModelsArray(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        models: ["ai-generated-content"],
      }),
    });

    const data = await response.json();

    return {
      method: "With models array: ['ai-generated-content']",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "With models array: ['ai-generated-content']",
      status: 0,
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test with generic model name
 */
async function testWithGenericModel(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        model_name: "generic",
      }),
    });

    const data = await response.json();

    return {
      method: "With model_name: generic",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "With model_name: generic",
      status: 0,
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test without classes, just model
 */
async function testModelOnly(): Promise<TestResult> {
  try {
    const response = await fetch(HIVE_V3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        url: TEST_IMAGE_URL,
        model_name: "ai-generated",
      }),
    });

    const data = await response.json();

    return {
      method: "With model_name: ai-generated (no classes)",
      status: response.status,
      success: response.ok,
      response: data,
    };
  } catch (error) {
    return {
      method: "With model_name: ai-generated (no classes)",
      status: 0,
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function testModelSpecifications(): Promise<TestResult[]> {
  console.log("🧪 Testing Hive v3 model specifications...\n");

  return [
    await testWithModelName(),
    await testWithModelsArray(),
    await testWithGenericModel(),
    await testModelOnly(),
  ];
}
