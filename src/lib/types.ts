import type {
  HasRequiredKeys,
  IfPossiblyUndefined,
  MaybePromise,
  UndefinedOptional,
} from "./utils";

export type MaybeFactory<T> = T | (() => T);

export type TestFunction<Opts = void, Return = void> = (
  ...args: IfPossiblyUndefined<Opts, [opts?: Opts], [opts: Opts]>
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

export type TestFactoryFn<TestOptions> = <Opts>(
  label: string,
  testFunction: TestFunction<Opts, MaybePromise<void>>,
  testOptions?: TestOptions,
) => TestFunction<Opts>;

export interface TestFactory<TestOptions> extends TestFactoryFn<TestOptions> {
  skip: TestFactoryFn<TestOptions>;
  only: TestFactoryFn<TestOptions>;
  todo: <Opts>(
    label: string,
    testFunction?: TestFunction<Opts, MaybePromise<void>>,
    testOptions?: TestOptions,
  ) => TestFunction<Opts>;
}

export type DescribeFactoryFn<TestOptions> = <OptsMap extends UnknownObject>(
  label: string,
  testMap: MaybeFactory<TestMap<OptsMap>>,
  testOptions?: TestOptions,
) => CombinedTestFunction<OptsMap>;

export interface DescribeFactory<TestOptions>
  extends DescribeFactoryFn<TestOptions> {
  skip: DescribeFactoryFn<TestOptions>;
  only: DescribeFactoryFn<TestOptions>;
  todo: <OptsMap extends UnknownObject>(
    label: string,
    testMap?: MaybeFactory<TestMap<OptsMap>>,
    testOptions?: TestOptions,
  ) => CombinedTestFunction<OptsMap>;
}

export type CombineFactory = <OptsMap extends UnknownObject>(
  testMap: TestMap<OptsMap>,
) => CombinedTestFunction<OptsMap>;

export interface TestFactoryOptions<TestOptions> {
  describe: {
    (label: string, testFunction: () => void, options?: TestOptions): void;
    skip: (
      label: string,
      testFunction: () => void,
      options?: TestOptions,
    ) => void;
    only: (
      label: string,
      testFunction: () => void,
      options?: TestOptions,
    ) => void;
    // jest doesn't have a todo for describe
    todo?: (
      label: string,
      testFunction?: () => void,
      options?: TestOptions,
    ) => void;
  };
  test: {
    (
      label: string,
      testFunction: (() => void) | (() => Promise<void>),
      testOptions?: TestOptions,
    ): void;
    skip: (
      label: string,
      testFunction: (() => void) | (() => Promise<void>),
      testOptions?: TestOptions,
    ) => void;
    only: (
      label: string,
      testFunction: (() => void) | (() => Promise<void>),
      testOptions?: TestOptions,
    ) => void;
    todo: (
      label: string,
      testFunction?: (() => void) | (() => Promise<void>),
      testOptions?: TestOptions,
    ) => void;
  };
}

export interface TestFactoryResult<TestOptions> {
  test: TestFactory<TestOptions>;
  it: TestFactory<TestOptions>;
  describe: DescribeFactory<TestOptions>;
  suite: DescribeFactory<TestOptions>;
  combine: CombineFactory;
}
