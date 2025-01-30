import { describe as vitestDescribe, test as vitestTest } from "vitest";
import { reverseOptionOrder } from "./lib/utils";
import { createTestFactory } from ".";

export type TestCollectorOptions = NonNullable<
  Parameters<typeof vitestTest>[1]
>;

const reverseViteOptions = reverseOptionOrder<TestCollectorOptions>;

export const { test, it, describe, combine } = createTestFactory({
  describe: Object.assign(reverseViteOptions(vitestDescribe), {
    skip: reverseViteOptions(vitestDescribe.skip),
    only: reverseViteOptions(vitestDescribe.only),
    todo: reverseViteOptions(vitestDescribe.todo) as never,
  }),
  test: Object.assign(reverseViteOptions(vitestTest), {
    skip: reverseViteOptions(vitestTest.skip),
    only: reverseViteOptions(vitestTest.only),
    todo: reverseViteOptions(vitestTest.todo) as never,
  }),
});
