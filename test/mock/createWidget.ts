import algolisearchHelper from 'algoliasearch-helper';
import {
  InitOptions,
  RenderOptions,
  DisposeOptions,
  Widget,
} from '../../src/types';
import { createMultiSearchResponse } from './createAPIResponse';
import { createInstantSearch } from './createInstantSearch';

export const createInitOptions = (
  args: Partial<InitOptions> = {}
): InitOptions => {
  const { instantSearchInstance = createInstantSearch(), ...rest } = args;

  return {
    instantSearchInstance,
    parent: instantSearchInstance.mainIndex,
    uiState: instantSearchInstance._initialUiState,
    templatesConfig: instantSearchInstance.templatesConfig,
    helper: instantSearchInstance.helper!,
    state: instantSearchInstance.helper!.state,
    createURL: jest.fn(() => '#'),
    ...rest,
  };
};

export const createRenderOptions = (
  args: Partial<RenderOptions> = {}
): RenderOptions => {
  const { instantSearchInstance = createInstantSearch(), ...rest } = args;
  const response = createMultiSearchResponse();
  const helper = args.helper || instantSearchInstance.helper!;
  const results = new algolisearchHelper.SearchResults(
    instantSearchInstance.helper!.state,
    response.results
  );

  return {
    instantSearchInstance,
    templatesConfig: instantSearchInstance.templatesConfig,
    helper,
    state: helper.state,
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
    createURL: jest.fn(() => '#'),
    ...rest,
  };
};

export const createDisposeOptions = (
  args: Partial<DisposeOptions> = {}
): DisposeOptions => {
  const instantSearchInstance = createInstantSearch();

  return {
    helper: instantSearchInstance.helper!,
    state: instantSearchInstance.helper!.state,
    ...args,
  };
};

export const createWidget = (args: Partial<Widget> = {}): Widget => ({
  init: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  ...args,
});
