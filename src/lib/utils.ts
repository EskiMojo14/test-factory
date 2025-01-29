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
