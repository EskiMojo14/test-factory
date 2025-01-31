# create-test-factory

A helper to create reusable test suites, which can run with different options.

```ts
// base.ts
import { expect } from "vitest";
import { describe, it } from "create-test-factory/vitest";
import { StandardSchemaV1 } from "@standard-schema/spec";

export const standardSchemaSuite = describe("standard schema suite", {
  exposesProps:
    it("exposes standard schema props", (schema: StandardSchemaV1) => {
      expect(schema).toHaveProperty("~standard");
      const standardProps = schema["~standard"];
      expect(standardProps).toEqual({
        version: 1,
        vendor: expect.any(String),
        validate: expect.any(Function),
      });
    }),
  validationResult:
    it("returns validation result", (schema: StandardSchemaV1<string>) => {
      expect(schema["~standard"].validate("test")).toMatchObject({
        value: "test",
      });
      expect(schema["~standard"].validate(123)).toMatchObject({
        issues: [
          expect.objectContaining({ message: expect.any(String), path: [] }),
        ],
      });
    }),
});

// zod.ts
import { z } from "zod";
import { standardSchemaSuite } from "./base";
standardSchemaSuite({
  exposesProps: z.number(),
  validationResult: z.string(),
});

// valibot.ts
import * as v from "valibot";
import { standardSchemaSuite } from "./base";
standardSchemaSuite({
  exposesProps: v.number(),
  validationResult: v.string(),
});
```

Prebuilt entry points:

- `create-test-factory/jest`
- `create-test-factory/jest-globals`
- `create-test-factory/vitest`
- `create-test-factory/bun`

Factory function is exported from `create-test-factory` entry point, for use with other test runners.
