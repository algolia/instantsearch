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
  const instantSearchInstance = createInstantSearch();

  return {
    instantSearchInstance,
    parent: null,
    templatesConfig: instantSearchInstance.templatesConfig,
    helper: instantSearchInstance.helper!,
    state: instantSearchInstance.helper!.state,
    createURL: jest.fn(() => '#'),
    ...args,
  };
};

export const createRenderOptions = (
  args: Partial<RenderOptions> = {}
): RenderOptions => {
  const instantSearchInstance = createInstantSearch();
  const response = createMultiSearchResponse();

  return {
    instantSearchInstance,
    templatesConfig: instantSearchInstance.templatesConfig,
    helper: instantSearchInstance.helper!,
    state: instantSearchInstance.helper!.state,
    results: new algolisearchHelper.SearchResults(
      instantSearchInstance.helper!.state,
      response.results
    ),
    searchMetadata: {
      isSearchStalled: false,
    },
    createURL: jest.fn(() => '#'),
    ...args,
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
  getConfiguration: jest.fn(),
  init: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  ...args,
});
