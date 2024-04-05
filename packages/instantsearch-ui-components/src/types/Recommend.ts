export type RecommendClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the title element
   */
  title: string;
  /**
   * Class names to apply to the container element
   */
  container: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to each item element
   */
  item: string;
};

export type RecommendTranslations = {
  /**
   * The title of the recommendation section
   */
  title: string;
  /**
   * The label of the horizontal slider
   */
  sliderLabel: string;
};

export type InnerComponentProps<TObject> = {
  classNames: Partial<RecommendClassNames>;
  recommendations: TObject[];
  translations: Partial<RecommendTranslations>;
};

export type RecordWithObjectID<TObject = Record<string, unknown>> = TObject & {
  objectID: string;
};

export type ItemComponentProps<TObject> = {
  item: TObject;
};

// align with instantsearch status
export type RecommendStatus = 'loading' | 'stalled' | 'idle';
