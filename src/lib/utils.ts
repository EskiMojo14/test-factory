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

/**
 * Take a function that receives options as the second argument, and return a function that receives options as the third argument.
 */
export function reverseOptionOrder<TestOptions extends {}>(test: {
  (label: string, testOptions: TestOptions, testFunction?: () => void): void;
  (label: string, testFunction?: () => void): void;
}): (
  label: string,
  testFunction?: () => void,
  testOptions?: TestOptions,
) => void;
/**
 * Take a function that receives options as the second argument, and return a function that receives options as the third argument.
 */
export function reverseOptionOrder<TestOptions extends {}>(test: {
  (label: string, testOptions: TestOptions, testFunction: () => void): void;
  (label: string, testFunction: () => void): void;
}): (
  label: string,
  testFunction: () => void,
  testOptions?: TestOptions,
) => void;
export function reverseOptionOrder<TestOptions extends {}>(test: {
  (label: string, testOptions: TestOptions, testFunction: () => void): void;
  (label: string, testFunction: () => void): void;
}) {
  return function reversed(
    label: string,
    testFunction: () => void,
    testOptions?: TestOptions,
  ) {
    if (testOptions) {
      test(label, testOptions, testFunction);
    } else {
      test(label, testFunction);
    }
  };
}
