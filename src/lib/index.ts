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

const isFactory = <T, Args extends Array<any>>(
  possibleFactory: MaybeFactory<T, Args>,
): possibleFactory is (...args: Args) => T =>
  typeof possibleFactory === "function";

function runTestMap<
  OptsMap extends UnknownObject,
  SuiteArgs extends Array<any>,
>(
  testMap: MaybeFactory<TestMap<OptsMap>, SuiteArgs>,
  optsMap: OptsMap = {} as never,
  suiteArgs: SuiteArgs,
) {
  const tests = isFactory(testMap) ? testMap(...suiteArgs) : testMap;
  for (const [key, testFunction] of Object.entries<
    TestFunction<OptsMap[keyof OptsMap]>
  >(tests as never)) {
    testFunction(optsMap[key as keyof OptsMap]);
  }
}

function wrapDescribe<TestOptions, SuiteArgs extends Array<any>>(
  describe: TestFactoryOptions<TestOptions, Array<any>, SuiteArgs>["describe"],
): DescribeFactory<TestOptions, SuiteArgs> {
  return Object.assign(
    function wrappedDescribe(label, testMap, options) {
      return (optsMap) => {
        describe(
          label,
          (...args) => {
            runTestMap(testMap, optsMap as never, args);
          },
          options,
        );
      };
    } as DescribeFactoryFn<TestOptions, SuiteArgs>,
    {
      skip: ((label, testMap, options) => (optsMap) => {
        describe.skip(
          label,
          (...args) => {
            runTestMap(testMap, optsMap as never, args);
          },
          options,
        );
      }) as DescribeFactoryFn<TestOptions, SuiteArgs>,
      only: ((label, testMap, options) => (optsMap) => {
        describe.only(
          label,
          (...args) => {
            runTestMap(testMap, optsMap as never, args);
          },
          options,
        );
      }) as DescribeFactoryFn<TestOptions, SuiteArgs>,
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
            (...args) => {
              if (testMap) runTestMap(testMap, optsMap as never, args);
            },
            options,
          );
        },
    } satisfies Record<keyof DescribeFactory<TestOptions, SuiteArgs>, unknown>,
  ) as never;
}

function wrapTest<TestOptions, TestArgs extends Array<any>>(
  test: TestFactoryOptions<TestOptions, TestArgs, Array<any>>["test"],
): TestFactory<TestOptions, TestArgs> {
  const bindOpts = (
    testFunction: TestFunction<any, MaybePromise<void>, TestArgs>,
    opts: unknown,
  ) => testFunction.bind(null, opts);

  return Object.assign(
    function wrappedTest(label, testFunction, testOptions) {
      return (opts) => {
        test(label, bindOpts(testFunction, opts), testOptions);
      };
    } as TestFactoryFn<TestOptions, TestArgs>,
    {
      skip: ((label, testFunction, testOptions) => (opts) => {
        test.skip(label, bindOpts(testFunction, opts), testOptions);
      }) as TestFactoryFn<TestOptions, TestArgs>,
      only: ((label, testFunction, testOptions) => (opts) => {
        test.only(label, bindOpts(testFunction, opts), testOptions);
      }) as TestFactoryFn<TestOptions, TestArgs>,
      todo:
        <Opts>(
          label: string,
          testFunction?: TestFunction<Opts, MaybePromise<void>, TestArgs>,
          testOptions?: TestOptions,
        ) =>
        (opts: Opts) => {
          test.todo(
            label,
            testFunction && bindOpts(testFunction, opts),
            testOptions,
          );
        },
    } satisfies Record<keyof TestFactory<TestOptions, TestArgs>, unknown>,
  ) as never;
}

export function createTestFactory<
  TestOptions,
  TestArgs extends Array<any>,
  SuiteArgs extends Array<any>,
>({
  describe,
  test,
}: TestFactoryOptions<TestOptions, TestArgs, SuiteArgs>): TestFactoryResult<
  TestOptions,
  TestArgs,
  SuiteArgs
> {
  const testFactory = wrapTest(test);
  const describeFactory = wrapDescribe(describe);

  return {
    test: testFactory,
    it: testFactory,
    describe: describeFactory,
    suite: describeFactory,
    combine: ((testMap) => (optsMap) => {
      runTestMap(testMap, optsMap as never, []);
    }) as CombineFactory,
  };
}
