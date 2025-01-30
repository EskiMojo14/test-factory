import type * as jest from "@jest/globals";
import { createTestFactory } from ".";

const jestDescribe = (globalThis as { describe?: typeof jest.describe })
  .describe;
const jestTest = (globalThis as { test?: typeof jest.test }).test;

if (!jestDescribe || !jestTest) {
  throw new Error("Jest globals not found");
}

export const { test, it, describe, suite, combine } = createTestFactory({
  describe: jestDescribe,
  test: jestTest,
});
