export type HighlightedParts = {
  value: string;
  isHighlighted: boolean;
};

// https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set/48244432#48244432
export type AtLeastOne<
  Target,
  Mapped = { [Key in keyof Target]: Pick<Target, Key> }
> = Partial<Target> & Mapped[keyof Mapped];
