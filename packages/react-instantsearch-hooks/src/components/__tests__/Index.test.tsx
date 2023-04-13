/**
 * @jest-environment jsdom
 */

import {
  createAlgoliaSearchClient,
  createSearchClient,
} from '@instantsearch/mocks';
import {
  createInstantSearchSpy,
  widgetSnapshotSerializer,
} from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React, { StrictMode } from 'react';

import { Configure } from '../../components/Configure';
import { IndexContext } from '../../lib/IndexContext';
import { noop } from '../../lib/noop';
import { Index } from '../Index';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

expect.addSnapshotSerializer(widgetSnapshotSerializer);

describe('Index', () => {
  test('throws when used outside of <InstantSearch>', () => {
    // Hide the errors from the test logs.
    jest.spyOn(console, 'error').mockImplementation(noop);

    expect(() => {
      render(<Index indexName="childIndex">Children</Index>);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[InstantSearch] The <Index> component must be used within <InstantSearch>."`
    );

    jest.spyOn(console, 'error').mockRestore();
  });

  test('renders children', () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <StrictMode>
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <Index indexName="childIndex">Children</Index>
        </InstantSearch>
      </StrictMode>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        Children
      </div>
    `);
  });

  test('provides the parent index', () => {
    const searchClient = createSearchClient({});
    let indexContext: IndexWidget | null = null;

    render(
      <StrictMode>
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <Index indexName="childIndex">
            <IndexContext.Consumer>
              {(context) => {
                indexContext = context;
                return null;
              }}
            </IndexContext.Consumer>
          </Index>
        </InstantSearch>
      </StrictMode>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
    expect(indexContext!.getIndexName()).toEqual('childIndex');
  });

  test('provides the nested parent index', () => {
    const searchClient = createSearchClient({});
    let indexContext: IndexWidget | null = null;

    render(
      <StrictMode>
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <Index indexName="childIndex">
            <Index indexName="subchildIndex">
              <IndexContext.Consumer>
                {(context) => {
                  indexContext = context;
                  return null;
                }}
              </IndexContext.Consumer>
            </Index>
          </Index>
        </InstantSearch>
      </StrictMode>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
    expect(indexContext!.getIndexName()).toEqual('subchildIndex');
  });

  test('adds the index only once on CSR', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    const { unmount } = render(
      <StrictMode>
        <InstantSearchSpy searchClient={searchClient} indexName="indexName">
          <Index indexName="indexName2">
            <Configure />
          </Index>
        </InstantSearchSpy>
      </StrictMode>
    );

    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);

    unmount();

    await waitFor(() => {
      expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(1);
      expect(indexContext.current!.removeWidgets).toHaveBeenCalledWith([
        expect.objectContaining({ $$type: 'ais.index' }),
      ]);
    });
  });

  test('adds the index only once on SSR', async () => {
    const searchClient = createAlgoliaSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();
    const initialResults = {
      indexName: {
        state: {},
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };

    // @TODO: this test doesn't work in Strict Mode
    const { unmount } = render(
      <InstantSearchSSRProvider initialResults={initialResults}>
        <InstantSearchSpy searchClient={searchClient} indexName="indexName">
          <Index indexName="indexName2">
            <Configure />
          </Index>
        </InstantSearchSpy>
      </InstantSearchSSRProvider>
    );

    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);

    unmount();

    await waitFor(() => {
      expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(1);
      expect(indexContext.current!.removeWidgets).toHaveBeenCalledWith([
        expect.objectContaining({ $$type: 'ais.index' }),
      ]);
    });
  });

  describe('parentIndexId', () => {
    test('adds the index with the correct parentIndexId', () => {
      const searchClient = createSearchClient({});
      const { InstantSearchSpy, searchContext } = createInstantSearchSpy();

      render(
        <StrictMode>
          <InstantSearchSpy searchClient={searchClient} indexName="indexName">
            <Index indexName="indexName2">
              <Index indexName="indexName3" parentIndexId={null}>
                <Index indexName="indexName4" parentIndexId="indexName2" />
                <Index indexName="indexName5" />
              </Index>
            </Index>
          </InstantSearchSpy>
        </StrictMode>
      );

      expect(searchContext.current!.mainIndex).toMatchInlineSnapshot(`
        Widget(ais.index) {
          $$widgetType: ais.index
          indexId: indexName
          widgets: [
            Widget(ais.index) {
              $$widgetType: ais.index
              indexId: indexName2
              widgets: [
                Widget(ais.index) {
                  $$widgetType: ais.index
                  indexId: indexName4
                }
              ]
            }
            Widget(ais.index) {
              $$widgetType: ais.index
              indexId: indexName3
              widgets: [
                Widget(ais.index) {
                  $$widgetType: ais.index
                  indexId: indexName5
                }
              ]
            }
          ]
        }
      `);
    });
  });
});
