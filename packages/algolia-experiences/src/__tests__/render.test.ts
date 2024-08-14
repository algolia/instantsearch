/**
 * @jest-environment jsdom
 */
import {
  createMultiSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import instantsearch from 'instantsearch.js';

import { configToIndex, injectStyles } from '../render';

import type { Configuration } from '../types';

describe('injectStyles', () => {
  it('should inject styles', () => {
    injectStyles();
    const style = document.head.querySelector('style');
    expect(style).toBeDefined();
    expect(style?.textContent).not.toHaveLength(0);
  });
});

describe('configToIndex', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  beforeEach(() => {
    error.mockClear();
  });

  it('errors if element not found', () => {
    const elements = new Map<string, HTMLElement>();
    const config = { id: 'foo', indexName: 'bar', children: [] };
    const result = configToIndex(config, elements);
    expect(result).toEqual([]);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      '[Algolia Experiences] Element with id foo not found'
    );
  });

  it('returns index with widgets', () => {
    const elements = new Map<string, HTMLElement>([
      ['foo', document.createElement('div')],
    ]);
    const config: Configuration = {
      id: 'foo',
      indexName: 'bar',
      children: [{ type: 'ais.hits', parameters: {}, children: [] }],
    };
    const result = configToIndex(config, elements);
    expect(result).toHaveLength(1);
    expect(result[0].getIndexName()).toEqual('bar');
    expect(result[0].getIndexId()).toEqual('foo');
    expect(result[0].getWidgets()).toHaveLength(1);
    expect(result[0].getWidgets()[0].$$type).toBe('ais.hits');
  });

  it('maps to the right widget types', () => {
    const elements = new Map<string, HTMLElement>([
      ['foo', document.createElement('div')],
    ]);
    const config: Configuration = {
      id: 'foo',
      indexName: 'bar',
      children: [
        { type: 'ais.hits', parameters: {}, children: [] },
        { type: 'ais.infiniteHits', parameters: {}, children: [] },
        {
          type: 'ais.frequentlyBoughtTogether',
          parameters: { objectIDs: [''] },
          children: [],
        },
        {
          type: 'ais.lookingSimilar',
          parameters: { objectIDs: [''] },
          children: [],
        },
        {
          type: 'ais.relatedProducts',
          parameters: { objectIDs: [''] },
          children: [],
        },
        { type: 'ais.trendingItems', parameters: {}, children: [] },
        {
          type: 'ais.refinementList',
          parameters: { attribute: 's' },
        },
        {
          type: 'ais.menu',
          parameters: { attribute: 's' },
        },
        {
          type: 'ais.hierarchicalMenu',
          parameters: { attributes: ['s'] },
        },
        {
          type: 'ais.breadcrumb',
          parameters: { attributes: ['s'] },
        },
        {
          type: 'ais.numericMenu',
          parameters: { attribute: 's', items: [{ label: '1', end: 0 }] },
        },
        {
          type: 'ais.rangeInput',
          parameters: { attribute: 's' },
        },
        {
          type: 'ais.rangeSlider',
          parameters: { attribute: 's' },
        },
        {
          type: 'ais.ratingMenu',
          parameters: { attribute: 's' },
        },
        {
          type: 'ais.toggleRefinement',
          parameters: { attribute: 's' },
        },
      ],
    };
    const result = configToIndex(config, elements);
    expect(result).toHaveLength(1);
    expect(result[0].getWidgets()).toHaveLength(config.children.length);
    expect(result[0].getWidgets().map((w) => w.$$type)).toEqual([
      'ais.hits',
      'ais.infiniteHits',
      'ais.frequentlyBoughtTogether',
      'ais.lookingSimilar',
      'ais.relatedProducts',
      'ais.trendingItems',
      'ais.refinementList',
      'ais.menu',
      'ais.hierarchicalMenu',
      'ais.breadcrumb',
      'ais.numericMenu',
      'ais.rangeInput',
      'ais.rangeSlider',
      'ais.ratingMenu',
      'ais.toggleRefinement',
    ]);
  });

  describe('template widgets', () => {
    it('maps children to item template', async () => {
      const searchClient = createSearchClient({
        search: () =>
          Promise.resolve(
            createMultiSearchResponse({
              hits: [
                {
                  objectID: 'foo',
                  name: 'foo',
                  image: 'bar',
                  _highlightResult: {
                    name: {
                      value: 'fo__ais-highlight__o__/ais-highlight__',
                      matchLevel: 'full' as const,
                      matchedWords: [],
                    },
                  },
                } as any,
              ],
            })
          ),
      });
      const search = instantsearch({ searchClient });
      const elements = new Map<string, HTMLElement>([
        ['foo', document.createElement('div')],
      ]);
      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        children: [
          {
            type: 'ais.hits',
            parameters: {},
            children: [
              {
                type: 'div',
                parameters: {
                  class: [
                    { type: 'string', value: 'item-' },
                    { type: 'attribute', path: ['objectID'] },
                  ],
                },
                children: [
                  {
                    type: 'paragraph',
                    parameters: {
                      text: [
                        { type: 'string', value: 'cols: ' },
                        { type: 'highlight', path: ['name'] },
                      ],
                    },
                  },
                  {
                    type: 'image',
                    parameters: {
                      src: [{ type: 'attribute', path: ['image'] }],
                      alt: [{ type: 'string', value: 'alt value' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = configToIndex(config, elements);
      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
          <div class="ais-Hits">
            <ol class="ais-Hits-list">
              <li class="ais-Hits-item">
                <div class="item-foo">
                  <p>
                    cols:
                    <span class="ais-Highlight">
                      <span class="ais-Highlight-nonHighlighted">
                        fo
                      </span>
                      <mark class="ais-Highlight-highlighted">
                        o
                      </mark>
                    </span>
                  </p>
                  <img src="bar"
                       alt="alt value"
                  >
                </div>
              </li>
            </ol>
          </div>
        </div>
      `);
    });
  });

  describe('panel widgets', () => {
    it('maps header parameter to panel header', async () => {
      const searchClient = createSearchClient({
        search: () =>
          Promise.resolve(
            createMultiSearchResponse({
              hits: [
                {
                  objectID: 'foo',
                  name: 'foo',
                  image: 'bar',
                  _highlightResult: {
                    name: {
                      value: 'fo__ais-highlight__o__/ais-highlight__',
                      matchLevel: 'full' as const,
                      matchedWords: [],
                    },
                  },
                } as any,
              ],
            })
          ),
      });
      const search = instantsearch({ searchClient });
      const elements = new Map<string, HTMLElement>([
        ['foo', document.createElement('div')],
      ]);

      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        children: [
          {
            type: 'ais.refinementList',
            parameters: { attribute: 'a', header: 'header text' },
          },
        ],
      };

      const result = configToIndex(config, elements);

      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
          <div class="ais-Panel">
            <div class="ais-Panel-header">
              <span>
                header text
              </span>
            </div>
            <div class="ais-Panel-body">
              <div>
                <div class="ais-RefinementList ais-RefinementList--noRefinement">
                </div>
              </div>
            </div>
          </div>
        </div>
      `);
    });
  });

  describe('configure', () => {
    it('applies configure widget', async () => {
      const searchClient = createSearchClient({
        search: jest.fn(() =>
          Promise.resolve(
            createMultiSearchResponse({
              hits: [
                {
                  objectID: 'foo',
                  name: 'foo',
                  image: 'bar',
                  _highlightResult: {
                    name: {
                      value: 'fo__ais-highlight__o__/ais-highlight__',
                      matchLevel: 'full' as const,
                      matchedWords: [],
                    },
                  },
                } as any,
              ],
            })
          )
        ),
      });
      const search = instantsearch({ searchClient });
      const elements = new Map<string, HTMLElement>([
        ['foo', document.createElement('div')],
      ]);

      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        children: [
          {
            type: 'ais.configure',
            parameters: { hitsPerPage: 5 },
          },
        ],
      };

      const result = configToIndex(config, elements);

      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'bar',
          params: {
            hitsPerPage: 5,
          },
        },
      ]);
    });
  });

  describe('other widgets', () => {
    it('renders pagination', async () => {
      const searchClient = createSearchClient({
        search: () =>
          Promise.resolve(
            createMultiSearchResponse({
              hits: [],
            })
          ),
      });
      const search = instantsearch({ searchClient });
      const elements = new Map<string, HTMLElement>([
        ['foo', document.createElement('div')],
      ]);

      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        children: [
          {
            type: 'ais.pagination',
            parameters: {},
          },
        ],
      };

      const result = configToIndex(config, elements);

      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(elements.get('foo')?.innerHTML).toMatchInlineSnapshot(`
        <div>
          <div class="ais-Pagination ais-Pagination--noRefinement">
            <ul class="ais-Pagination-list">
              <li class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage">
                <span class="ais-Pagination-link"
                      aria-label="First Page"
                >
                  «
                </span>
              </li>
              <li class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage">
                <span class="ais-Pagination-link"
                      aria-label="Previous Page"
                >
                  ‹
                </span>
              </li>
              <li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected">
                <a class="ais-Pagination-link"
                   aria-label="Page 1"
                   href="#"
                >
                  1
                </a>
              </li>
              <li class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage">
                <span class="ais-Pagination-link"
                      aria-label="Next Page"
                >
                  ›
                </span>
              </li>
              <li class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage">
                <span class="ais-Pagination-link"
                      aria-label="Last Page, Page 0"
                >
                  »
                </span>
              </li>
            </ul>
          </div>
        </div>
      `);
    });
  });
});
