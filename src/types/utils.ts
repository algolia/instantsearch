export type HighlightedParts = {
  value: string;
  isHighlighted: boolean;
};

// https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set/48244432#48244432
export type AtLeastOne<
  TTarget,
  TMapped = { [Key in keyof TTarget]: Pick<TTarget, Key> }
> = Partial<TTarget> & TMapped[keyof TMapped];
