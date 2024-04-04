export type RecommendClassNames = Partial<{
  root: string;
  title: string;
  container: string;
  list: string;
  item: string;
}>;

export type RecommendTranslations = Partial<{
  title: string;
  // Horizontal Slider
  sliderLabel: string;
}>;

export type InnerComponentProps<TObject> = {
  classNames: RecommendClassNames;
  recommendations: TObject[];
  translations: RecommendTranslations;
};

export type RecordWithObjectID<TObject = Record<string, unknown>> = TObject & {
  objectID: string;
};

export type ItemComponentProps<TObject> = {
  item: TObject;
};
