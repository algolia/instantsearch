export type HighlightedParts = {
  value: string;
  isHighlighted: boolean;
};

/**
 * Makes at least one of an object property required.
 * https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set/48244432#48244432
 */
export type AtLeastOne<
  TTarget,
  TMapped = { [Key in keyof TTarget]: Pick<TTarget, Key> }
> = Partial<TTarget> & TMapped[keyof TMapped];

/**
 * Removes intermediary composed types in IntelliSense
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * Make certain keys in an object required.
 */
export type RequiredKeys<TObject, TKeys extends keyof TObject> = Expand<
  Required<Pick<TObject, TKeys>> & Omit<TObject, TKeys>
>;

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/**
 * Make certain keys of an object optional.
 */
export type PartialKeys<TObj, TKeys extends keyof TObj> = Omit<TObj, TKeys> &
  Partial<Pick<TObj, TKeys>>;
