import type * as jest from "@jest/globals";
import type { DescribeFactory, TestFactory } from ".";
import { createTestFactory } from ".";

const jestDescribe = (globalThis as { describe?: typeof jest.describe })
  .describe;
const jestTest = (globalThis as { test?: typeof jest.test }).test;

if (!jestDescribe || !jestTest) {
  throw new Error("Jest globals not found");
}

const res = createTestFactory({
  describe: jestDescribe,
  test: jestTest,
});
export const test: TestFactory<number> = res.test;
export const it: TestFactory<number> = res.it;
export const describe: DescribeFactory<number> = res.describe;
export const suite: DescribeFactory<number> = res.suite;

export { combine } from ".";
