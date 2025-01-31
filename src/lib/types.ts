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

type InputDescribeFn<TestOptions> = (
  label: string,
  testFunction: () => void,
  options?: TestOptions,
) => void;

interface InputDescribe<TestOptions> extends InputDescribeFn<TestOptions> {
  skip: InputDescribeFn<TestOptions>;
  only: InputDescribeFn<TestOptions>;
  // optional because jest doesn't have a todo for describe
  todo?: (
    label: string,
    testFunction?: () => void,
    options?: TestOptions,
  ) => void;
}

type InputTestFn<TestOptions> = (
  label: string,
  testFunction: (() => void) | (() => Promise<void>),
  options?: TestOptions,
) => void;

interface InputTest<TestOptions> extends InputTestFn<TestOptions> {
  skip: InputTestFn<TestOptions>;
  only: InputTestFn<TestOptions>;
  todo: (
    label: string,
    testFunction?: (() => void) | (() => Promise<void>),
    options?: TestOptions,
  ) => void;
}

export interface TestFactoryOptions<TestOptions> {
  describe: InputDescribe<TestOptions>;
  test: InputTest<TestOptions>;
}

export interface TestFactoryResult<TestOptions> {
  test: TestFactory<TestOptions>;
  it: TestFactory<TestOptions>;
  describe: DescribeFactory<TestOptions>;
  suite: DescribeFactory<TestOptions>;
}
