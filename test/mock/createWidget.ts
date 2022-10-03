import algoliasearchHelper from 'algoliasearch-helper';
import type {
  InitOptions,
  RenderOptions,
  DisposeOptions,
  Widget,
} from '../../src/types';
import type { IndexInitOptions } from '../../src/widgets/index/index';
import { createMultiSearchResponse } from './createAPIResponse';
import { createInstantSearch } from './createInstantSearch';

export const createInitOptions = (
  args: Partial<InitOptions> = {}
): InitOptions => {
  const { instantSearchInstance = createInstantSearch(), ...rest } = args;
  const helper = args.helper || instantSearchInstance.helper!;

  return {
    instantSearchInstance,
    parent: instantSearchInstance.mainIndex,
    uiState: instantSearchInstance._initialUiState,
    templatesConfig: instantSearchInstance.templatesConfig,
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
    parent: instantSearchInstance.mainIndex,
    ...args,
  };
};

export const createWidget = <TWidget extends Widget>(
  args: Partial<TWidget> = {}
): TWidget =>
  ({
    $$type: 'mock.widget',
    init: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    ...args,
  } as unknown as TWidget);
