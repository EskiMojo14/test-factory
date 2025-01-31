import { describe as jestDescribe, test as jestTest } from "@jest/globals";
import { createTestFactory } from ".";

export const { test, it, describe, suite } = createTestFactory({
  describe: jestDescribe,
  test: jestTest,
});

export { combine } from ".";
