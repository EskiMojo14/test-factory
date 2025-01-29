import type {
  TestFactory,
  TestFactoryOptions,
  TestFactoryResult,
  TestFunction,
  TestMap,
  DescribeFactory,
  DescribeFactoryFn,
} from "./types";
import type { MaybePromise } from "./utils";

function runTestMap<OptsMap extends Record<string, unknown>>(
  testMap: TestMap<OptsMap>,
  optsMap: OptsMap,
) {
  for (const [key, testFunction] of Object.entries<
    TestFunction<OptsMap[keyof OptsMap]>
  >(testMap as never)) {
    testFunction(optsMap[key as keyof OptsMap]);
  }
}

function wrapDescribe(
  describe: TestFactoryOptions<{}>["describe"],
): DescribeFactory {
  return Object.assign(
    function wrappedDescribe(label, testMap) {
      return (optsMap) => {
        describe(label, () => {
          runTestMap(testMap, optsMap as never);
        });
      };
    } satisfies DescribeFactoryFn,
    {
      skip: (label, testMap) => (optsMap) => {
        describe.skip(label, () => {
          runTestMap(testMap, optsMap as never);
        });
      },
      only: (label, testMap) => (optsMap) => {
        describe.only(label, () => {
          runTestMap(testMap, optsMap as never);
        });
      },
    } satisfies Omit<DescribeFactory, "">,
  );
}

function wrapTest<TestOptions>(
  test: TestFactoryOptions<TestOptions>["test"],
): TestFactory<TestOptions> {
  return Object.assign(
    function wrappedTest<Opts>(
      label: string,
      testFunction: TestFunction<Opts, MaybePromise<void>>,
      testOptions?: TestOptions,
    ) {
      return (opts: Opts) => {
        test(label, () => testFunction(opts), testOptions);
      };
    },
    {
      skip:
        <Opts>(
          label: string,
          testFunction: TestFunction<Opts, MaybePromise<void>>,
          testOptions?: TestOptions,
        ) =>
        (opts: Opts) => {
          test.skip(label, () => testFunction(opts), testOptions);
        },
      only:
        <Opts>(
          label: string,
          testFunction: TestFunction<Opts, MaybePromise<void>>,
          testOptions?: TestOptions,
        ) =>
        (opts: Opts) => {
          test.only(label, () => testFunction(opts), testOptions);
        },
      todo:
        <Opts>(
          label: string,
          testFunction?: TestFunction<Opts, MaybePromise<void>>,
          testOptions?: TestOptions,
        ) =>
        (opts: Opts) => {
          test.todo(
            label,
            testFunction && (() => testFunction(opts)),
            testOptions,
          );
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } satisfies Record<keyof TestFactory<TestOptions>, any>,
  ) as never;
}

export function createTestFactory<TestOptions>({
  describe,
  test,
}: TestFactoryOptions<TestOptions>): TestFactoryResult<TestOptions> {
  const testFactory = wrapTest(test);

  return {
    test: testFactory,
    it: testFactory,
    describe: wrapDescribe(describe),
    combine: (testMap) => (optsMap) => {
      runTestMap(testMap, optsMap as never);
    },
  };
}
