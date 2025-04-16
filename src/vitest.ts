import { describe as vitestDescribe, test as vitestTest } from "vitest";
import { reverseOptionOrder } from "./lib/utils";
import type { DescribeFactory, TestFactory } from ".";
import { createTestFactory } from ".";

export type TestCollectorOptions = NonNullable<
  Parameters<typeof vitestTest>[1]
>;

const reverseViteOptions = reverseOptionOrder<TestCollectorOptions>;

const res = createTestFactory({
  describe: Object.assign(reverseViteOptions(vitestDescribe), {
    skip: reverseViteOptions(vitestDescribe.skip),
    only: reverseViteOptions(vitestDescribe.only),
    todo: reverseViteOptions(vitestDescribe.todo),
  }),
  test: Object.assign(reverseViteOptions(vitestTest), {
    skip: reverseViteOptions(vitestTest.skip),
    only: reverseViteOptions(vitestTest.only),
    todo: reverseViteOptions(vitestTest.todo),
  }),
});
export const test: TestFactory<TestCollectorOptions> = res.test;
export const it: TestFactory<TestCollectorOptions> = res.it;
export const describe: DescribeFactory<TestCollectorOptions> = res.describe;
export const suite: DescribeFactory<TestCollectorOptions> = res.suite;

export { combine } from ".";
