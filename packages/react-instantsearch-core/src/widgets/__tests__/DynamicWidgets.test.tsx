/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Panel } from 'react-instantsearch-dom';

import {
  connectHierarchicalMenu,
  connectMenu,
  connectPagination,
  connectRefinementList,
} from '../..';
import DynamicWidgets from '../DynamicWidgets';
import InstantSearch from '../InstantSearch';

const EMPTY_RESPONSE = {
  results: [
    {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      exhaustiveNbHits: true,
      query: '',
      queryAfterRemoval: '',
      params:
        'highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&query=&facets=%5B%5D&tagFilters=',
      index: 'instant_search',
      processingTimeMS: 2,
    },
  ],
};

const createSearchClient = () => ({
  search: jest.fn(() => Promise.resolve(EMPTY_RESPONSE)),
  searchForFacetValues: jest.fn(() => Promise.resolve({})),
});

const RefinementList = connectRefinementList(
  ({ attribute }: { attribute: string }) => `RefinementList(${attribute})`
);

const HierarchicalMenu = connectHierarchicalMenu(
  ({ attributes }: { attributes: string[] }) =>
    `HierarchicalMenu([${attributes.join(', ')}])`
);

const Menu = connectMenu(
  ({ attribute, otherProp }: { attribute: string; otherProp: any }) =>
    `Menu(${attribute})${otherProp ? ` ${JSON.stringify({ otherProp })}` : ''}`
);

const Pagination = connectPagination(() => {
  return <div>pagination</div>;
});

describe('DynamicWidgets', () => {
  describe('before results', () => {
    test('does not render the result of transformItems', () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch searchClient={searchClient} indexName="test">
          <DynamicWidgets transformItems={() => ['test1']}>
            <RefinementList attribute="test1" />
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`<div />`);
    });
  });

  describe('with results', () => {
    const resultsState = {
      metadata: [],
      rawResults: EMPTY_RESPONSE.results,
      state: {
        index: 'instant_search',
        query: '',
      },
    };

    test('default items is empty', () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
          resultsState={resultsState}
        >
          <DynamicWidgets transformItems={(items: string[]) => items}>
            <RefinementList attribute="test1" />
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`<div />`);
    });

    test('renders return of transformItems', () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
          resultsState={resultsState}
        >
          <DynamicWidgets transformItems={() => ['test1']}>
            <RefinementList attribute="test1" />
            <HierarchicalMenu attributes={['test2', 'test3']} />
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          RefinementList(test1)
        </div>
      `);
    });

    test('renders from results', () => {
      const searchClient = createSearchClient();

      const RESULTS = [
        {
          ...resultsState,
          rawResults: [
            {
              ...resultsState.rawResults[0],
              renderingContent: {
                facetOrdering: { facets: { order: ['test1', 'test2'] } },
              },
            },
          ],
        },

        {
          ...resultsState,
          rawResults: [
            {
              ...resultsState.rawResults[0],
              renderingContent: {
                facetOrdering: { facets: { order: ['test2', 'test1'] } },
              },
            },
          ],
        },

        {
          ...resultsState,
          rawResults: [
            {
              ...resultsState.rawResults[0],
              renderingContent: {
                facetOrdering: { facets: { order: ['test1'] } },
              },
            },
          ],
        },
      ];

      const Component = ({
        result,
      }: {
        result: React.ComponentProps<typeof InstantSearch>['resultsState'];
      }) => (
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          resultsState={result}
        >
          <DynamicWidgets>
            <RefinementList attribute="test1" />
            <HierarchicalMenu attributes={['test2', 'test3']} />
          </DynamicWidgets>
        </InstantSearch>
      );
      {
        const { container } = render(
          <Component
            // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
            result={RESULTS[0]}
          />
        );

        expect(container).toMatchInlineSnapshot(`
          <div>
            RefinementList(test1)
            HierarchicalMenu([test2, test3])
          </div>
        `);
      }
      {
        const { container } = render(
          <Component
            // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
            result={RESULTS[1]}
          />
        );

        expect(container).toMatchInlineSnapshot(`
          <div>
            HierarchicalMenu([test2, test3])
            RefinementList(test1)
          </div>
        `);
      }
      {
        const { container } = render(
          <Component
            // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
            result={RESULTS[2]}
          />
        );

        expect(container).toMatchInlineSnapshot(`
          <div>
            RefinementList(test1)
          </div>
        `);
      }
    });

    test('renders items in panel', () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
          resultsState={resultsState}
        >
          <DynamicWidgets transformItems={() => ['test1', 'test3', 'test5']}>
            <RefinementList attribute="test1" />
            <RefinementList attribute="test2" />
            <Panel>
              <RefinementList attribute="test3" />
            </Panel>
            <Panel>
              <RefinementList attribute="test4" />
            </Panel>
            <Panel>
              <HierarchicalMenu attributes={['test5', 'test5.1']} />
            </Panel>
            <Panel>
              <HierarchicalMenu attributes={['test6', 'test6.1']} />
            </Panel>
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          RefinementList(test1)
          <div
            class="ais-Panel"
          >
            <div
              class="ais-Panel-body"
            >
              RefinementList(test3)
            </div>
          </div>
          <div
            class="ais-Panel"
          >
            <div
              class="ais-Panel-body"
            >
              HierarchicalMenu([test5, test5.1])
            </div>
          </div>
        </div>
      `);
    });

    test("does not render items that aren't directly in children", () => {
      const fallbackRender = jest.fn(() => null);

      // prevent duplicate console errors still showing up
      const spy = jest.spyOn(console, 'error');
      spy.mockImplementation(() => {});

      const searchClient = createSearchClient();

      const Wrapped = ({ attr }: { attr: string }) => (
        <div>
          <HierarchicalMenu attributes={[attr, `${attr}.1`]} />
        </div>
      );

      render(
        <ErrorBoundary fallbackRender={fallbackRender}>
          <InstantSearch
            searchClient={searchClient}
            indexName="test"
            // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
            resultsState={resultsState}
          >
            <DynamicWidgets transformItems={() => ['test1']}>
              <Wrapped attr="test1" />
            </DynamicWidgets>
          </InstantSearch>
        </ErrorBoundary>
      );

      // note: this test now expects a failure, but if we ever implement deep
      // fetching of attribute, we expect this to render Wrapped
      expect(
        (fallbackRender.mock.calls[0] as any)[0].error
      ).toMatchInlineSnapshot(
        `[Error: Could not find "attribute" prop for UnknownComponent.]`
      );
    });

    test('does not render items non-attribute widgets', () => {
      const fallbackRender = jest.fn(() => null);

      // prevent duplicate console errors still showing up
      const spy = jest.spyOn(console, 'error');
      spy.mockImplementation(() => {});

      const searchClient = createSearchClient();

      render(
        <ErrorBoundary fallbackRender={fallbackRender}>
          <InstantSearch
            searchClient={searchClient}
            indexName="test"
            // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
            resultsState={resultsState}
          >
            <DynamicWidgets transformItems={() => ['test1']}>
              <Pagination />
            </DynamicWidgets>
          </InstantSearch>
        </ErrorBoundary>
      );

      expect(
        (fallbackRender.mock.calls[0] as any)[0].error
      ).toMatchInlineSnapshot(
        `[Error: Could not find "attribute" prop for UnknownComponent.]`
      );
    });

    test('does not render attributes without widget by default', () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
          resultsState={resultsState}
        >
          <DynamicWidgets transformItems={() => ['test1', 'test2', 'test3']}>
            <RefinementList attribute="test1" />
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          RefinementList(test1)
        </div>
      `);
    });

    test("uses fallbackComponent component to create widgets that aren't explicitly declared", () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
          resultsState={resultsState}
        >
          <DynamicWidgets
            transformItems={() => ['test1', 'test2', 'test3']}
            fallbackComponent={Menu}
          >
            <RefinementList attribute="test1" />
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          RefinementList(test1)
          Menu(test2)
          Menu(test3)
        </div>
      `);
    });

    test("uses fallbackComponent callback to create widgets that aren't explicitly declared", () => {
      const searchClient = createSearchClient();

      const { container } = render(
        <InstantSearch
          searchClient={searchClient}
          indexName="test"
          // @ts-ignore resultsState in InstantSearch is typed wrongly to deal with multi-index
          resultsState={resultsState}
        >
          <DynamicWidgets
            transformItems={() => ['test1', 'test2', 'test3']}
            fallbackComponent={({ attribute }: { attribute: string }) => (
              <Menu attribute={attribute} otherProp />
            )}
          >
            <RefinementList attribute="test1" />
          </DynamicWidgets>
        </InstantSearch>
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          RefinementList(test1)
          Menu(test2) {"otherProp":true}
          Menu(test3) {"otherProp":true}
        </div>
      `);
    });
  });
});
