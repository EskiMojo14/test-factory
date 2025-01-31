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
      expect(schema["~standard"]).toEqual({
        version: 1,
        vendor: expect.any(String),
        validate: expect.any(Function),
      });
    }),
  validationResult: describe("validation result", {
    validResult:
      it("returns validation result", (schema: StandardSchemaV1<string>) => {
        expect(schema["~standard"].validate("test")).toMatchObject({
          value: "test",
        });
      }),
    invalidResult:
      it("returns invalid result", (schema: StandardSchemaV1<string>) => {
        expect(schema["~standard"].validate(123)).toMatchObject({
          issues: [
            expect.objectContaining({ message: expect.any(String), path: [] }),
          ],
        });
      }),
  }),
});

// zod.ts
import { z } from "zod";
import { standardSchemaSuite } from "./base";
standardSchemaSuite({
  exposesProps: z.number(),
  validationResult: {
    validResult: z.string(),
    invalidResult: z.string(),
  },
});

// valibot.ts
import * as v from "valibot";
import { standardSchemaSuite } from "./base";
standardSchemaSuite({
  exposesProps: v.number(),
  validationResult: {
    validResult: v.string(),
    invalidResult: v.string(),
  },
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
    expect(schema["~standard"]).toEqual({
      version: 1,
      vendor: expect.any(String),
      validate: expect.any(Function),
    });
  },
  { timeout: 1000 },
);

// now it has
itHasStandardProps(schema);
```

_Also supports `skip`, `only`, and `todo`_

#### `describe`/`suite`

Receives a map of test functions, and returns a function which will call each test function with the provided options, inside of a describe block.

```ts
const standardSchemaSuite = describe("standard schema suite", {
  itHasStandardProps,
  itReturnsValidationResult,
  // ...
});

standardSchemaSuite({
  itHasStandardProps: schema,
  itReturnsValidationResult: schema,
});
```

_Also supports `skip`, `only`, and `todo` - if `todo` is not available, it will fall back to `skip`_

If any setup is needed, you can pass a function which returns a map of test functions.

```ts
const standardSchemaSuite = describe("standard schema suite", () => ({
  itHasStandardProps,
  itReturnsValidationResult,
  // ...
}));

standardSchemaSuite({
  itHasStandardProps: schema,
  itReturnsValidationResult: schema,
});
```

Describe functions can also be nested:

```ts
const standardSchemaSuite = describe("standard schema suite", {
  itHasStandardProps,
  itReturnsValidationResult: describe("validation result", {
    itReturnsValidResult,
    itReturnsInvalidResult,
  }),
});

standardSchemaSuite({
  itHasStandardProps: schema,
  itReturnsValidationResult: {
    itReturnsValidResult: schema,
    itReturnsInvalidResult: schema,
  },
});
```

Factory functions can also accept an options object, which will be merged with the options for each test function.

```ts
const itReturnsValidationResult = describe("validation result", ({
  schema,
}: {
  schema: StandardSchemaV1<string>;
}) => ({
  itReturnsValidResult: it("returns valid result", () => {
    expect(schema["~standard"].validate("test")).toMatchObject({
      value: "test",
    });
  }),
  itReturnsInvalidResult: it("returns invalid result", () => {
    expect(schema["~standard"].validate(123)).toMatchObject({
      issues: [
        expect.objectContaining({ message: expect.any(String), path: [] }),
      ],
    });
  }),
}));

itReturnsValidationResult({
  schema,
  // options for itReturnsValidResult and itReturnsInvalidResult are optional
  // because they're not specified (or allow undefined)
});
```

### `combine`

Receives a map of test functions, and returns a function which will call each test function with the provided options.

_Also re-exported from prebuilt entry points._

```ts
const standardSchemaSuite = combine({
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
import {
  describe as originalDescribe,
  test as originalTest,
} from "my-test-runner";
import { createTestFactory } from "create-test-factory";

export const { test, it, describe, suite } = createTestFactory({
  describe: originalDescribe,
  test: originalTest,
});
```
