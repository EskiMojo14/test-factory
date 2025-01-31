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

Factory function is exported from `create-test-factory` entry point, for use with other test runners.

## API Reference

### Prebuilt entry points

For convenience, prebuilt entry points are provided for the following test runners:

- `create-test-factory/jest` (if you use jest with globals)
- `create-test-factory/jest-globals` (if you import from `@jest/globals`)
- `create-test-factory/vitest`
- `create-test-factory/bun`

#### `test`/`it`

Creates a function which will call the test runner's original `test` function, with the provided options.

```ts
// hasn't asserted anything yet
const itHasStandardProps = it(
  "has standard props",
  (schema: StandardSchemaV1) => {
    expect(schema).toHaveProperty("~standard");
  },
  { timeout: 1000 },
);

// now it has
itHasStandardProps(schema);
```

#### `describe`/`suite`

Receives a map of test functions, and returns a function which will call each test function with the provided options, inside of a describe block.

```ts
const standardSchemSuite = describe("standardSchemaProps", {
  itHasStandardProps,
  itReturnsValidationResult,
  // ...
});

standardSchemaSuite({
  itHasStandardProps: schema,
  itReturnsValidationResult: schema,
});
```

### `combine`

Receives a map of test functions, and returns a function which will call each test function with the provided options.

_Also re-exported from prebuilt entry points._

```ts
const standardSchemSuite = combine({
  itHasStandardProps,
  itReturnsValidationResult,
  // ...
});

standardSchemaSuite({
  itHasStandardProps: schema,
  itReturnsValidationResult: schema,
});
```

### `createTestFactory`

For other test runners, you can create your own factory function. The `createTestFactory` function takes a `describe(label, testFunction, options?)` and a `test(label, testFunction, options?)` function, and returns a factory function with the same API as the prebuilt entry points.

```ts
import { describe, test } from "my-test-runner";
import { createTestFactory } from "create-test-factory";

const { test, it, describe, suite } = createTestFactory({
  describe,
  test,
});
```
