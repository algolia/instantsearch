import algoliasearchHelper from 'algoliasearch-helper';
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
    renderState: instantSearchInstance.renderState,
    scopedResults: [],
    createURL: jest.fn(() => '#'),
    searchMetadata: {
      isSearchStalled: false,
    },
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
    response.results
  );

  return {
    instantSearchInstance,
    parent: instantSearchInstance.mainIndex,
    templatesConfig: instantSearchInstance.templatesConfig,
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
    parent: instantSearchInstance.mainIndex,
    ...args,
  };
};

export const createWidget = <TWidget extends Widget>(
  args: Partial<TWidget> = {}
): TWidget =>
  (({
    $$type: 'mock.widget',
    init: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    ...args,
  } as unknown) as TWidget);
