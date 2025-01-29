import { describe as jestDescribe, test as jestTest } from "@jest/globals";
import { createTestFactory } from ".";

export const { test, it, describe, combine } = createTestFactory({
  describe: jestDescribe,
  test: jestTest,
});
