import algoliasearchHelper from 'algoliasearch-helper';
import index from '../../src/widgets/index/index';
import { InstantSearch } from '../../src/types';
import { createSearchClient } from './createSearchClient';

export const createInstantSearch = (
  args: Partial<InstantSearch> = {}
): InstantSearch => {
  const searchClient = createSearchClient();
  const mainHelper = algoliasearchHelper(searchClient, 'index_name', {});
  const mainIndex = index({ indexName: 'index_name' });

  return {
    mainIndex,
    mainHelper,
    helper: mainHelper, // @TODO: use the Helper from the index once the RoutingManger uses the index
    templatesConfig: {},
    insightsClient: null,
    scheduleStalledRender: jest.fn(),
    scheduleSearch: jest.fn(),
    scheduleRender: jest.fn(),
    _isSearchStalled: true,
    _searchParameters: {},
    _createAbsoluteURL: jest.fn(() => '#'),
    ...args,
  };
};
