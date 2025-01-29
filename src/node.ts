/* eslint-disable @typescript-eslint/no-misused-promises */
import { describe as nodeDescribe, test as nodeTest } from "node:test";
import type { OverloadsToUnion } from "./lib/utils";
import { reverseOptionOrder } from "./lib/utils";
import { createTestFactory } from ".";

type TestContext = typeof nodeTest extends (
  testFunction: (t: infer T) => void,
) => void
  ? T
  : never;

type SuiteContext = typeof nodeDescribe extends (
  testFunction: (t: infer T) => void,
) => void
  ? T
  : never;

type GetTestOptions<OverloadUnion> = OverloadUnion extends (
  label: string,
  testOptions: infer TestOptions,
  testFunction: (...args: any) => void,
) => void
  ? TestOptions
  : never;

type TestOptions = Exclude<
  GetTestOptions<OverloadsToUnion<typeof nodeTest>>,
  ((...args: any) => void) | undefined
>;

const reverseDescribeOptions = reverseOptionOrder<
  TestOptions,
  [s: SuiteContext]
>;
const reverseTestOptions = reverseOptionOrder<TestOptions, [t: TestContext]>;

export const { test, it, describe, combine } = createTestFactory({
  describe: Object.assign(reverseDescribeOptions(nodeDescribe), {
    skip: reverseDescribeOptions(nodeDescribe.skip),
    only: reverseDescribeOptions(nodeDescribe.only),
    todo: reverseDescribeOptions(nodeDescribe.todo) as never,
  }),
  test: Object.assign(reverseTestOptions(nodeTest), {
    skip: reverseTestOptions(nodeTest.skip),
    only: reverseTestOptions(nodeTest.only),
    todo: reverseTestOptions(nodeTest.todo) as never,
  }),
});
