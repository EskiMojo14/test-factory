import { describe as jestDescribe, test as jestTest } from "@jest/globals";
import type { DescribeFactory, TestFactory } from ".";
import { createTestFactory } from ".";

const res = createTestFactory({
  describe: jestDescribe,
  test: jestTest,
});
export const test: TestFactory<number> = res.test;
export const it: TestFactory<number> = res.it;
export const describe: DescribeFactory<number> = res.describe;
export const suite: DescribeFactory<number> = res.suite;

export { combine } from ".";
