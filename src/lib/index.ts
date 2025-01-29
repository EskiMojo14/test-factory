import type {
  TestFactory,
  TestFactoryOptions,
  TestFactoryResult,
  TestFunction,
  TestMap,
  DescribeFactory,
  DescribeFactoryFn,
  UnknownObject,
  CombineFactory,
  MaybeFactory,
  TestFactoryFn,
} from "./types";
import type { MaybePromise } from "./utils";

const isFactory = <T>(
  possibleFactory: MaybeFactory<T>,
): possibleFactory is () => T => typeof possibleFactory === "function";

function runTestMap<OptsMap extends UnknownObject>(
  testMap: MaybeFactory<TestMap<OptsMap>>,
  optsMap: OptsMap = {} as never,
) {
  const tests = isFactory(testMap) ? testMap() : testMap;
  for (const [key, testFunction] of Object.entries<
    TestFunction<OptsMap[keyof OptsMap]>
  >(tests as never)) {
    testFunction(optsMap[key as keyof OptsMap]);
  }
}

function wrapDescribe<TestOptions>(
  describe: TestFactoryOptions<TestOptions>["describe"],
): DescribeFactory<TestOptions> {
  return Object.assign(
    function wrappedDescribe(label, testMap, options) {
      return (optsMap) => {
        describe(
          label,
          () => {
            runTestMap(testMap, optsMap as never);
          },
          options,
        );
      };
    } as DescribeFactoryFn<TestOptions>,
    {
      skip: ((label, testMap, options) => (optsMap) => {
        describe.skip(
          label,
          () => {
            runTestMap(testMap, optsMap as never);
          },
          options,
        );
      }) as DescribeFactoryFn<TestOptions>,
      only: ((label, testMap, options) => (optsMap) => {
        describe.only(
          label,
          () => {
            runTestMap(testMap, optsMap as never);
          },
          options,
        );
      }) as DescribeFactoryFn<TestOptions>,
      todo:
        <OptsMap extends UnknownObject>(
          label: string,
          testMap?: TestMap<OptsMap>,
          options?: TestOptions,
        ) =>
        (optsMap: OptsMap) => {
          const todo = describe.todo ?? describe.skip;
          todo(
            label,
            () => {
              if (testMap) runTestMap(testMap, optsMap as never);
            },
            options,
          );
        },
    } satisfies Record<keyof DescribeFactory<TestOptions>, unknown>,
  ) as never;
}

function wrapTest<TestOptions>(
  test: TestFactoryOptions<TestOptions>["test"],
): TestFactory<TestOptions> {
  const bindOpts = <Opts>(
    testFunction: TestFunction<Opts, MaybePromise<void>>,
    opts: unknown,
  ) => testFunction.bind(null, opts as never);

  return Object.assign(
    function wrappedTest(label, testFunction, testOptions) {
      return (opts) => {
        test(label, bindOpts(testFunction, opts), testOptions);
      };
    } as TestFactoryFn<TestOptions>,
    {
      skip: ((label, testFunction, testOptions) => (opts) => {
        test.skip(label, bindOpts(testFunction, opts), testOptions);
      }) as TestFactoryFn<TestOptions>,
      only: ((label, testFunction, testOptions) => (opts) => {
        test.only(label, bindOpts(testFunction, opts), testOptions);
      }) as TestFactoryFn<TestOptions>,
      todo:
        <Opts>(
          label: string,
          testFunction?: TestFunction<Opts, MaybePromise<void>>,
          testOptions?: TestOptions,
        ) =>
        (opts: Opts) => {
          test.todo(
            label,
            testFunction && bindOpts(testFunction, opts),
            testOptions,
          );
        },
    } satisfies Record<keyof TestFactory<TestOptions>, unknown>,
  ) as never;
}

export function createTestFactory<TestOptions>({
  describe,
  test,
}: TestFactoryOptions<TestOptions>): TestFactoryResult<TestOptions> {
  const testFactory = wrapTest(test);
  const describeFactory = wrapDescribe(describe);

  return {
    test: testFactory,
    it: testFactory,
    describe: describeFactory,
    suite: describeFactory,
    combine: ((testMap) => (optsMap) => {
      runTestMap(testMap, optsMap as never);
    }) as CombineFactory,
  };
}
