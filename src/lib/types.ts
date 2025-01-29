import type {
  HasRequiredKeys,
  IfPossiblyUndefined,
  MaybePromise,
  UndefinedOptional,
} from "./utils";

export type MaybeFactory<T, Args extends Array<any>> =
  | T
  | ((...args: Args) => T);

export type TestFunction<
  Opts = void,
  Return = void,
  TestArgs extends Array<any> = [],
> = (
  ...args: [
    ...IfPossiblyUndefined<Opts, [opts?: Opts], [opts: Opts]>,
    ...TestArgs,
  ]
) => Return;

export type UnknownObject = Record<string, unknown>;

export type TestMap<OptsMap extends UnknownObject> = {
  [K in keyof OptsMap]: TestFunction<OptsMap[K]>;
};

export type CombinedTestFunction<OptsMap extends UnknownObject> = TestFunction<
  HasRequiredKeys<
    UndefinedOptional<OptsMap>,
    UndefinedOptional<OptsMap>,
    UndefinedOptional<OptsMap> | undefined
  >
>;

export type TestFactoryFn<TestOptions, TestArgs extends Array<any>> = <Opts>(
  label: string,
  testFunction: TestFunction<Opts, MaybePromise<void>, TestArgs>,
  testOptions?: TestOptions,
) => TestFunction<Opts>;

export interface TestFactory<TestOptions, TestArgs extends Array<any>>
  extends TestFactoryFn<TestOptions, TestArgs> {
  skip: TestFactoryFn<TestOptions, TestArgs>;
  only: TestFactoryFn<TestOptions, TestArgs>;
  todo: <Opts>(
    label: string,
    testFunction?: TestFunction<Opts, MaybePromise<void>, TestArgs>,
    testOptions?: TestOptions,
  ) => TestFunction<Opts>;
}

export type DescribeFactoryFn<TestOptions, SuiteArgs extends Array<any>> = <
  OptsMap extends UnknownObject,
>(
  label: string,
  testMap: MaybeFactory<TestMap<OptsMap>, SuiteArgs>,
  testOptions?: TestOptions,
) => CombinedTestFunction<OptsMap>;

export interface DescribeFactory<TestOptions, SuiteArgs extends Array<any>>
  extends DescribeFactoryFn<TestOptions, SuiteArgs> {
  skip: DescribeFactoryFn<TestOptions, SuiteArgs>;
  only: DescribeFactoryFn<TestOptions, SuiteArgs>;
  todo: <OptsMap extends UnknownObject>(
    label: string,
    testMap?: MaybeFactory<TestMap<OptsMap>, SuiteArgs>,
    testOptions?: TestOptions,
  ) => CombinedTestFunction<OptsMap>;
}

export type CombineFactory = <OptsMap extends UnknownObject>(
  testMap: TestMap<OptsMap>,
) => CombinedTestFunction<OptsMap>;

export interface TestFactoryOptions<
  TestOptions,
  TestArgs extends Array<any>,
  SuiteArgs extends Array<any>,
> {
  describe: {
    (
      label: string,
      testFunction: (...args: SuiteArgs) => void,
      options?: TestOptions,
    ): void;
    skip: (
      label: string,
      testFunction: (...args: SuiteArgs) => void,
      options?: TestOptions,
    ) => void;
    only: (
      label: string,
      testFunction: (...args: SuiteArgs) => void,
      options?: TestOptions,
    ) => void;
    // jest doesn't have a todo for describe
    todo?: (
      label: string,
      testFunction?: (...args: SuiteArgs) => void,
      options?: TestOptions,
    ) => void;
  };
  test: {
    (
      label: string,
      testFunction:
        | ((...testArgs: TestArgs) => void)
        | ((...testArgs: TestArgs) => Promise<void>),
      testOptions?: TestOptions,
    ): void;
    skip: (
      label: string,
      testFunction:
        | ((...testArgs: TestArgs) => void)
        | ((...testArgs: TestArgs) => Promise<void>),
      testOptions?: TestOptions,
    ) => void;
    only: (
      label: string,
      testFunction:
        | ((...testArgs: TestArgs) => void)
        | ((...testArgs: TestArgs) => Promise<void>),
      testOptions?: TestOptions,
    ) => void;
    todo: (
      label: string,
      testFunction?:
        | ((...testArgs: TestArgs) => void)
        | ((...testArgs: TestArgs) => Promise<void>),
      testOptions?: TestOptions,
    ) => void;
  };
}

export interface TestFactoryResult<
  TestOptions,
  TestArgs extends Array<any>,
  SuiteArgs extends Array<any>,
> {
  test: TestFactory<TestOptions, TestArgs>;
  it: TestFactory<TestOptions, TestArgs>;
  describe: DescribeFactory<TestOptions, SuiteArgs>;
  suite: DescribeFactory<TestOptions, SuiteArgs>;
  combine: CombineFactory;
}
