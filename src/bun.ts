import type { TestOptions } from "bun:test";
import { describe as bunDescribe, test as bunTest } from "bun:test";
import type { DescribeFactory, TestFactory } from ".";
import { createTestFactory } from ".";

const res = createTestFactory({
  describe: bunDescribe,
  test: bunTest,
});
export const test: TestFactory<number | TestOptions> = res.test;
export const it: TestFactory<number | TestOptions> = res.it;
export const describe: DescribeFactory<number | TestOptions> = res.describe;
export const suite: DescribeFactory<number | TestOptions> = res.suite;

export { combine } from ".";
