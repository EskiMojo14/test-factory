// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Compute<T> = { [K in keyof T]: T[K] } & unknown;

export type MaybePromise<T> = T | Promise<T>;

export type IfPossiblyUndefined<T, True, False> = [undefined] extends [T]
  ? True
  : False;

export type UndefinedKeys<T> = {
  [K in keyof T]: IfPossiblyUndefined<T[K], K, never>;
}[keyof T];

export type UndefinedOptional<T> = Compute<
  Partial<Pick<T, UndefinedKeys<T>>> & Omit<T, UndefinedKeys<T>>
>;

export type HasRequiredKeys<T, True, False> =
  Exclude<keyof T, UndefinedKeys<T>> extends never ? False : True;

type Fn<Args extends Array<any>, Return> = (...args: Args) => Return;

export type OverloadsToUnion<T> = T extends {
  (...args: infer Args1): infer Return1;
  (...args: infer Args2): infer Return2;
  (...args: infer Args3): infer Return3;
  (...args: infer Args4): infer Return4;
  (...args: infer Args5): infer Return5;
}
  ?
      | Fn<Args1, Return1>
      | Fn<Args2, Return2>
      | Fn<Args3, Return3>
      | Fn<Args4, Return4>
      | Fn<Args5, Return5>
  : never;

/**
 * Take a function that receives options as the second argument, and return a function that receives options as the third argument.
 */
export const reverseOptionOrder = <
  TestOptions extends {},
  TestArgs extends Array<any>,
>(test: {
  (
    label: string,
    testOptions: TestOptions,
    testFunction: (...args: TestArgs) => void,
  ): void;
  (label: string, testFunction: (...args: TestArgs) => void): void;
}) =>
  function reversed(
    label: string,
    testFunction: (...args: TestArgs) => void,
    testOptions?: TestOptions,
  ) {
    if (testOptions) {
      test(label, testOptions, testFunction);
    } else {
      test(label, testFunction);
    }
  };
