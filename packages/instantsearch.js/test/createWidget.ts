import { createMultiSearchResponse } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInstantSearch } from './createInstantSearch';

import type { SearchResponse } from 'algoliasearch-helper/types/algoliasearch';
import type {
  InitOptions,
  RenderOptions,
  DisposeOptions,
  Widget,
  IndexInitOptions,
} from 'instantsearch-core';

export const createInitOptions = (
  args: Partial<InitOptions> = {}
): InitOptions => {
  const { instantSearchInstance = createInstantSearch(), ...rest } = args;
  const helper = args.helper || instantSearchInstance.helper!;

  return {
    instantSearchInstance,
    parent: instantSearchInstance.mainIndex,
    uiState: instantSearchInstance._initialUiState,
    helper,
    state: helper.state,
    renderState: instantSearchInstance.renderState,
    scopedResults: [],
    createURL: jest.fn(() => '#'),
    searchMetadata: {
      isSearchStalled: false,
    },
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
    ...rest,
  };
};

export const createIndexInitOptions = (
  args: Partial<IndexInitOptions> = {}
): IndexInitOptions => {
  const { instantSearchInstance = createInstantSearch(), ...rest } = args;

  return {
    instantSearchInstance,
    parent: instantSearchInstance.mainIndex,
    uiState: instantSearchInstance._initialUiState,
    ...rest,
  };
};

export const createRenderOptions = (
  args: Partial<RenderOptions> = {}
): RenderOptions => {
  const { instantSearchInstance = createInstantSearch(), ...rest } = args;
  const response = createMultiSearchResponse();
  const helper = args.helper || instantSearchInstance.helper!;
  const results = new algoliasearchHelper.SearchResults(
    instantSearchInstance.helper!.state,
    response.results as Array<SearchResponse<any>>
  );

  return {
    instantSearchInstance,
    parent: instantSearchInstance.mainIndex,
    helper,
    state: helper.state,
    renderState: instantSearchInstance.renderState,
    results,
    scopedResults: [
      {
        indexId: helper.state.index,
        helper,
        results,
      },
    ],
    searchMetadata: {
      isSearchStalled: false,
    },
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
    createURL: jest.fn(() => '#'),
    ...rest,
  };
};

export const createDisposeOptions = (
  args: Partial<DisposeOptions> = {}
): DisposeOptions => {
  const instantSearchInstance = createInstantSearch();
  const helper = args.helper || instantSearchInstance.helper!;

  return {
    helper,
    state: helper.state,
    recommendState: helper.recommendState,
    parent: instantSearchInstance.mainIndex,
    ...args,
  };
};

export const createWidget = (args: Partial<Widget> = {}): Widget =>
  ({
    $$type: 'mock.widget',
    init: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    ...args,
  } as unknown as Widget);
