import type { PlainSearchParameters } from 'algoliasearch-helper';
import type React from 'react';

export const Content: React.FC<{
  linkedStoryGroup?: string;
  hasPlayground?: boolean;
  children?: React.ReactNode;
  resultsView?: React.ReactNode;
}>;

export const WrapWithHits: React.FC<{
  appId?: string;
  apiKey?: string;
  indexName?: string;
  children?: React.ReactNode;
  searchBox?: boolean;
  linkedStoryGroup?: string;
  hasPlayground?: boolean;
  pagination?: boolean;
  searchParameters?: PlainSearchParameters;
  hitsElement?: element;
  initialSearchState?: any;
  onSearchStateChange?: (searchState: any) => any;
}>;
