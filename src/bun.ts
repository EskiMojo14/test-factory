import { describe as bunDescribe, test as bunTest } from "bun:test";
import { createTestFactory } from ".";

export const { test, it, describe, suite, combine } = createTestFactory({
  describe: bunDescribe,
  test: bunTest,
});
