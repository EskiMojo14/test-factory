import { describe as bunDescribe, test as bunTest } from "bun:test";
import { createTestFactory } from ".";

export const { test, it, describe, suite } = createTestFactory({
  describe: bunDescribe,
  test: bunTest,
});

export { combine } from ".";
