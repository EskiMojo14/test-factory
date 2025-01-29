import { describe as vitestDescribe, test as vitestTest } from "vitest";
import type { TestFunction } from ".";
import { createTestFactory } from ".";

export type TestCollectorOptions = NonNullable<
  Parameters<typeof vitestTest>[1]
>;

const reverseOptionOrder = (test: {
  (
    label: string,
    testOptions: TestCollectorOptions,
    testFunction: TestFunction,
  ): void;
  (label: string, testFunction: TestFunction): void;
}) =>
  function reversedTest(
    label: string,
    testFunction: TestFunction,
    testOptions?: TestCollectorOptions,
  ) {
    if (testOptions) {
      test(label, testOptions, testFunction);
    } else {
      test(label, testFunction);
    }
  };

export const { test, it, describe, combine } =
  createTestFactory<TestCollectorOptions>({
    describe: vitestDescribe,
    test: Object.assign(reverseOptionOrder(vitestTest), {
      skip: reverseOptionOrder(vitestTest.skip),
      only: reverseOptionOrder(vitestTest.only),
      todo: reverseOptionOrder(vitestTest.todo) as never,
    }),
  });
