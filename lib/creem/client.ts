import { Creem } from "creem";

/**
 * Creates a Creem client instance for API calls
 * Make sure to set CREEM_API_KEY in your environment variables
 */
export function getCreemClient() {
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    throw new Error("CREEM_API_KEY is not set in environment variables");
  }

  // serverIdx: 0 = production (https://api.creem.io), 1 = test (https://test-api.creem.io)
  const serverIdx = process.env.CREEM_TEST_MODE === "true" ? 1 : 0;

  return new Creem({
    apiKey,
    serverIdx,
  });
}
