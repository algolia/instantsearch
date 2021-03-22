import { SearchResults } from 'algoliasearch-helper';
import { BindEventForHits, SendEventForHits } from '../../lib/utils';
import { Hits } from '../../types';
import { HitsCSSClasses, HitsTemplates } from '../../widgets/hits/hits';

export type HitsProps = {
  cssClasses: HitsCSSClasses;
  hits: Hits;
  results: SearchResults;
  sendEvent: SendEventForHits;
  bindEvent: BindEventForHits;
  templateProps: {
    [key: string]: any;
    templates: HitsTemplates;
  };
};
