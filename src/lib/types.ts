import type {
  IfPossiblyUndefined,
  MaybePromise,
  UndefinedOptional,
} from "./utils";

export type TestFunction<Opts = void, Return = void> = (
  ...args: IfPossiblyUndefined<Opts, [opts?: Opts], [opts: Opts]>
) => Return;

export type TestMap<OptsMap extends Record<string, unknown>> = {
  [K in keyof OptsMap]: TestFunction<OptsMap[K]>;
};

export type CombinedTestFunction<OptsMap extends Record<string, unknown>> = (
  optsMap: UndefinedOptional<OptsMap>,
) => void;

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

export type DescribeFactoryFn = <OptsMap extends Record<string, unknown>>(
  label: string,
  testMap: TestMap<OptsMap>,
) => CombinedTestFunction<OptsMap>;

export interface DescribeFactory extends DescribeFactoryFn {
  skip: DescribeFactoryFn;
  only: DescribeFactoryFn;
  todo: <OptsMap extends Record<string, unknown>>(
    label: string,
    testMap?: TestMap<OptsMap>,
  ) => CombinedTestFunction<OptsMap>;
}

export type CombineFactory = <OptsMap extends Record<string, unknown>>(
  testMap: TestMap<OptsMap>,
) => CombinedTestFunction<OptsMap>;

export interface TestFactoryOptions<TestOptions> {
  describe: {
    (label: string, testFunction: () => void): void;
    skip: (label: string, testFunction: () => void) => void;
    only: (label: string, testFunction: () => void) => void;
    todo?: (label: string, testFunction?: () => void) => void;
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
  describe: DescribeFactory;
  combine: CombineFactory;
}
