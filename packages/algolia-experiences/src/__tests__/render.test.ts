/**
 * @jest-environment jsdom
 */
import {
  createMultiSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
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

  it('returns index with widgets', () => {
    const element = document.createElement('div');
    const config: Configuration = {
      id: 'foo',
      indexName: 'bar',
      name: 'Foo',
      blocks: [{ type: 'ais.hits', parameters: {}, children: [] }],
    };
    const result = configToIndex(config, element);
    expect(result).toHaveLength(1);
    expect(result[0].getIndexName()).toEqual('bar');
    expect(result[0].getIndexId()).toEqual('foo');
    expect(result[0].getWidgets()).toHaveLength(1);
    expect(result[0].getWidgets()[0].$$type).toBe('ais.hits');
  });

  it('maps to the right widget types', () => {
    const element = document.createElement('div');
    const config: Configuration = {
      id: 'foo',
      indexName: 'bar',
      name: 'Foo',
      blocks: [
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
    const result = configToIndex(config, element);
    expect(result).toHaveLength(1);
    expect(result[0].getWidgets()).toHaveLength(config.blocks.length);
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
      const element = document.createElement('div');
      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        name: 'Foo',
        blocks: [
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
      const result = configToIndex(config, element);
      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(element.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(element.innerHTML).toMatchInlineSnapshot(`
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

  describe('layout widgets', () => {
    it('maps children to item template with a carousel layout', async () => {
      const searchClient = createRecommendSearchClient({
        minimal: true,
      });
      const search = instantsearch({ searchClient });
      const element = document.createElement('div');
      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        name: 'Foo',
        blocks: [
          {
            type: 'ais.trendingItems',
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
      const result = configToIndex(config, element);
      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(element.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(element.innerHTML).toMatchInlineSnapshot(`
      <div>
        <section class="ais-TrendingItems">
          <h3 class="ais-TrendingItems-title">
            Trending items
          </h3>
          <div class="ais-Carousel">
            <button title="Previous"
                    aria-label="Previous"
                    hidden
                    aria-controls="ais-Carousel-0"
                    class="ais-Carousel-navigation ais-Carousel-navigation--previous"
            >
              <svg width="8"
                   height="16"
                   viewbox="0 0 8 16"
                   fill="none"
              >
                <path fillrule="evenodd"
                      cliprule="evenodd"
                      fill="currentColor"
                      d="M7.13809 0.744078C7.39844 1.06951 7.39844 1.59715 7.13809 1.92259L2.27616 8L7.13809 14.0774C7.39844 14.4028 7.39844 14.9305 7.13809 15.2559C6.87774 15.5814 6.45563 15.5814 6.19528 15.2559L0.861949 8.58926C0.6016 8.26382 0.6016 7.73618 0.861949 7.41074L6.19528 0.744078C6.45563 0.418641 6.87774 0.418641 7.13809 0.744078Z"
                >
                </path>
              </svg>
            </button>
            <ol class="ais-Carousel-list ais-TrendingItems-list"
                tabindex="0"
                id="ais-Carousel-0"
                aria-roledescription="carousel"
                aria-label="Items"
                aria-live="polite"
            >
              <li class="ais-Carousel-item ais-TrendingItems-item"
                  aria-roledescription="slide"
                  aria-label="1 of 2"
              >
                <div class="item-1">
                  <p>
                    cols:
                    <span class="ais-Highlight">
                    </span>
                  </p>
                  <img src
                       alt="alt value"
                  >
                </div>
              </li>
              <li class="ais-Carousel-item ais-TrendingItems-item"
                  aria-roledescription="slide"
                  aria-label="2 of 2"
              >
                <div class="item-2">
                  <p>
                    cols:
                    <span class="ais-Highlight">
                    </span>
                  </p>
                  <img src
                       alt="alt value"
                  >
                </div>
              </li>
            </ol>
            <button title="Next"
                    aria-label="Next"
                    aria-controls="ais-Carousel-0"
                    class="ais-Carousel-navigation ais-Carousel-navigation--next"
            >
              <svg width="8"
                   height="16"
                   viewbox="0 0 8 16"
                   fill="none"
              >
                <path fillrule="evenodd"
                      cliprule="evenodd"
                      fill="currentColor"
                      d="M0.861908 15.2559C0.601559 14.9305 0.601559 14.4028 0.861908 14.0774L5.72384 8L0.861908 1.92259C0.601559 1.59715 0.601559 1.06952 0.861908 0.744079C1.12226 0.418642 1.54437 0.418642 1.80472 0.744079L7.13805 7.41074C7.3984 7.73618 7.3984 8.26382 7.13805 8.58926L1.80472 15.2559C1.54437 15.5814 1.12226 15.5814 0.861908 15.2559Z"
                >
                </path>
              </svg>
            </button>
          </div>
        </section>
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
      const element = document.createElement('div');

      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        name: 'Foo',
        blocks: [
          {
            type: 'ais.refinementList',
            parameters: { attribute: 'a', header: 'header text' },
          },
        ],
      };

      const result = configToIndex(config, element);

      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(element.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(element.innerHTML).toMatchInlineSnapshot(`
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
      const element = document.createElement('div');

      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        name: 'Foo',
        blocks: [
          {
            type: 'ais.configure',
            parameters: { hitsPerPage: 5 },
          },
        ],
      };

      const result = configToIndex(config, element);

      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(element).toBeEmptyDOMElement();

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
      const element = document.createElement('div');

      const config: Configuration = {
        id: 'foo',
        indexName: 'bar',
        name: 'Foo',
        blocks: [
          {
            type: 'ais.pagination',
            parameters: {},
          },
        ],
      };

      const result = configToIndex(config, element);

      expect(result).toHaveLength(1);
      expect(result[0].getWidgets()).toHaveLength(1);

      expect(element?.innerHTML).toMatchInlineSnapshot(`
        <div>
        </div>
      `);

      search.addWidgets(result);
      search.start();
      await wait(100);

      expect(element?.innerHTML).toMatchInlineSnapshot(`
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
