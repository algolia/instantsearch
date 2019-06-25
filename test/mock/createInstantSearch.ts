import algoliasearchHelper from 'algoliasearch-helper';
import { InstantSearch } from '../../src/types';

export const createInstantSearch = (
  args: Partial<InstantSearch> = {}
): InstantSearch => {
  const helper = algoliasearchHelper({} as any, '', {});

  return {
    helper,
    widgets: [],
    templatesConfig: {},
    insightsClient: null,
    ...args,
  };
};
