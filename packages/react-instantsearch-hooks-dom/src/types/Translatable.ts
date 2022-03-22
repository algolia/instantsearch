export type Translatable<
  TProps extends { translations: Record<string, string> }
> = Omit<TProps, 'translations'> & {
  translations?: Partial<TProps['translations']>;
};
