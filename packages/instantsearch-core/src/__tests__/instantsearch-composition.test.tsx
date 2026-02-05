/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createCompositionClient,
  createSearchClient,
} from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import { wait } from '@instantsearch/testutils/wait';
import originalHelper from 'algoliasearch-helper';

import { InstantSearch, index, connectConfigure, connectSearchBox } from '..';

type AlgoliaHelperModule = typeof algoliasearchHelper;

const algoliasearchHelper = castToJestMock(originalHelper);
jest.mock('algoliasearch-helper', () => {
  const module = jest.requireActual<AlgoliaHelperModule>(
    'algoliasearch-helper'
  );
  const mock = jest.fn((...args: Parameters<AlgoliaHelperModule>) => {
    const helper = module(...args);

    const searchWithComposition = helper.searchWithComposition.bind(helper);
    const searchForCompositionFacetValues =
      helper.searchForCompositionFacetValues.bind(helper);

    helper.searchWithComposition = jest.fn((...searchArgs) => {
      return searchWithComposition(...searchArgs);
    });
    helper.searchForCompositionFacetValues = jest.fn((...searchArgs) => {
      return searchForCompositionFacetValues(...searchArgs);
    });

    return helper;
  });

  Object.entries(module).forEach(([key, value]) => {
    // @ts-expect-error Object.entries loses type safety
    mock[key] = value;
  });

  return mock;
});

const configure = connectConfigure(() => {});
const virtualSearchBox = connectSearchBox(() => {});

beforeEach(() => {
  algoliasearchHelper.mockClear();
});

describe('Composition implementation', () => {
  describe('root index warning', () => {
    it('throws if compositionID & index widget is provided', () => {
      expect(() => {
        const search = new InstantSearch({
          searchClient: createCompositionClient(),
          compositionID: 'my-composition',
        });

        search.addWidgets([index({ indexName: 'indexName' })]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`index\` widget cannot be used with a composition-based InstantSearch implementation.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
        `);
    });

    it('does not throw if compositionID is not provided while index widget is provided', () => {
      expect(() => {
        const search = new InstantSearch({
          searchClient: createSearchClient(),
        });

        search.addWidgets([index({ indexName: 'indexName' })]);
      }).not.toThrow();
    });
  });

  it('replaces the regular `searchForFacetValues` with `searchForCompositionFacetValues` if CompositionID is provided', () => {
    const searchClient = createCompositionClient();
    const search = new InstantSearch({
      compositionID: 'my-composition',
      searchClient,
    });

    search.start();

    search.helper?.searchForFacetValues('brand', 'algolia', 20);

    expect(
      search.helper!.searchForCompositionFacetValues
    ).toHaveBeenNthCalledWith(1, 'brand', 'algolia', 20);
  });

  it('does not replace the regular `searchForFacetValues` with `searchForCompositionFacetValues` if CompositionID is not provided', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({ searchClient });

    search.start();

    search.helper?.searchForFacetValues('brand', 'algolia', 20);

    expect(
      search.helper!.searchForCompositionFacetValues
    ).not.toHaveBeenCalled();
  });

  it('replaces the regular `search` with `searchWithComposition` if CompositionID is provided', async () => {
    const searchClient = createCompositionClient();
    const search = new InstantSearch({
      compositionID: 'my-composition',
      searchClient,
    });

    search.addWidgets([virtualSearchBox({})]);
    search.start();

    await wait(0);

    expect(search.helper!.searchWithComposition).toHaveBeenCalledTimes(1);
  });

  describe('when performing a search', () => {
    it('should remove highlightTags parameters', async () => {
      const searchClient = createCompositionClient();
      const search = new InstantSearch({
        compositionID: 'my-composition',
        searchClient,
      });

      search.addWidgets([
        configure({
          searchParameters: {
            highlightPreTag: 'whatever',
            highlightPostTag: 'whenever',
          },
        }),
        virtualSearchBox({}),
      ]);
      search.start();

      await wait(0);

      expect(search.helper!.searchWithComposition).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenNthCalledWith(1, {
        compositionID: 'my-composition',
        requestBody: { params: { query: '' } },
      });
    });

    it('should transform index parameter into compositionID and remove it from parameters', async () => {
      const searchClient = createCompositionClient();
      const search = new InstantSearch({
        compositionID: 'my-composition',
        searchClient,
      });

      search.addWidgets([
        configure({
          searchParameters: { index: 'please-do-not-do-that' },
        }),
        virtualSearchBox({}),
      ]);
      search.start();

      await wait(0);

      expect(search.helper!.searchWithComposition).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenNthCalledWith(1, {
        compositionID: 'please-do-not-do-that',
        requestBody: { params: { query: '' } },
      });
    });

    it('should handle facets & disjunctiveFacets', async () => {
      const searchClient = createCompositionClient();
      const search = new InstantSearch({
        compositionID: 'my-composition',
        searchClient,
      });

      search.addWidgets([
        configure({
          searchParameters: {
            facets: ['brand'],
            disjunctiveFacets: ['categories'],
          },
        }),
        virtualSearchBox({}),
      ]);
      search.start();

      await wait(0);

      expect(search.helper!.searchWithComposition).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenNthCalledWith(1, {
        compositionID: 'my-composition',
        requestBody: {
          params: {
            query: '',
            facets: ['brand', 'categories', 'disjunctive(author)'],
            facetFilters: [['author:Terry Pratchett']],
          },
        },
      });
    });

    it('should handle various filters', async () => {
      const searchClient = createCompositionClient();
      const search = new InstantSearch({
        compositionID: 'my-composition',
        searchClient,
      });

      search.addWidgets([
        configure({
          searchParameters: {
            tagFilters: ['tags'],
            facetFilters: ['brand'],
            numericFilters: ['price'],
          },
        }),
        virtualSearchBox({}),
      ]);
      search.start();

      await wait(0);

      expect(search.helper!.searchWithComposition).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenNthCalledWith(1, {
        compositionID: 'my-composition',
        requestBody: {
          params: {
            query: '',
            tagFilters: ['tags'],
            facetFilters: ['brand'],
            numericFilters: ['price'],
          },
        },
      });
    });
  });
});
