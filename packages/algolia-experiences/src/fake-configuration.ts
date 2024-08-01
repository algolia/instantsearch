import type { Configuration } from './types';

const CONFIGURATION_OBJECT: Record<string, Configuration> = {
  qsdfqsdf: {
    id: 'qsdfqsdf',
    indexName: 'instant_search',
    children: [
      {
        type: 'ais.searchBox',
        parameters: {},
      },
      {
        type: 'columns',
        children: [
          [
            {
              type: 'ais.refinementList',
              parameters: {
                attribute: 'brand',
                header: 'Brand',
              },
            },
          ],
          [
            {
              type: 'ais.hits',
              parameters: {},
              children: [
                {
                  type: 'div',
                  parameters: {
                    text: [
                      { type: 'string', value: 'cols: ' },
                      { type: 'highlight', path: ['name'] },
                    ],
                  },
                },
              ],
            },
          ],
        ],
      },
      {
        type: 'ais.configure',
        parameters: {
          hitsPerPage: 2,
        },
      },
      {
        type: 'ais.hits',
        parameters: {},
        children: [
          {
            type: 'div',
            parameters: {
              text: [
                { type: 'string', value: 'one: ' },
                { type: 'highlight', path: ['name'] },
              ],
            },
          },
        ],
      },
    ],
  },
  'other-one': {
    id: 'other-one',
    indexName: 'instant_search',
    children: [
      {
        type: 'ais.configure',
        parameters: {
          hitsPerPage: 3,
        },
      },
      {
        type: 'ais.hits',
        parameters: {},
        children: [
          {
            type: 'div',
            parameters: {
              text: [
                { type: 'string', value: 'other: ' },
                { type: 'attribute', path: ['name'] },
              ],
            },
          },
        ],
      },
      {
        type: 'ais.pagination',
        parameters: {
          padding: 2,
        },
      },
      {
        type: 'ais.trendingItems',
        parameters: { limit: 4 },
        children: [
          {
            type: 'div',
            parameters: {
              text: [
                { type: 'string', value: 'trending: ' },
                { type: 'attribute', path: ['name'] },
              ],
            },
          },
          {
            type: 'image',
            parameters: {
              src: [{ type: 'attribute', path: ['image'] }],
              alt: [{ type: 'string', value: '' }],
            },
          },
        ],
      },
    ],
  },
  'category:audio': {
    id: 'category:audio',
    indexName: 'instant_search',
    children: [
      {
        type: 'ais.configure',
        parameters: {
          hitsPerPage: 9,
          filters: 'categories:"Audio"',
        },
      },
      {
        type: 'columns',
        children: [
          [
            {
              type: 'ais.refinementList',
              parameters: {
                attribute: 'brand',
                header: 'Brand',
                collapsed: true,
                searchable: true,
              },
            },
          ],
          [
            {
              type: 'ais.hits',
              parameters: {},
              children: [
                {
                  type: 'image',
                  parameters: {
                    src: [{ type: 'attribute', path: ['image'] }],
                    alt: [{ type: 'string', value: '' }],
                  },
                },
                {
                  type: 'div',
                  parameters: {
                    text: [{ type: 'attribute', path: ['name'] }],
                  },
                },
                {
                  type: 'div',
                  parameters: {
                    text: [
                      { type: 'string', value: '$' },
                      { type: 'attribute', path: ['price'] },
                    ],
                  },
                },
              ],
            },
            {
              type: 'ais.trendingItems',
              parameters: { limit: 4 },
              children: [
                {
                  type: 'image',
                  parameters: {
                    src: [{ type: 'attribute', path: ['image'] }],
                    alt: [{ type: 'string', value: '' }],
                  },
                },
              ],
            },
            {
              type: 'ais.pagination',
              parameters: {
                padding: 2,
              },
            },
          ],
        ],
      },
    ],
  },
};
const CONFIGURATION_MAP = new Map<string, Configuration>(
  Object.entries(CONFIGURATION_OBJECT)
);
const FAKE_DELAY = 1000;

export function fakeFetchConfiguration(ids: string[]) {
  return new Promise((resolve) => setTimeout(resolve, FAKE_DELAY)).then(() =>
    ids.map((id) => CONFIGURATION_MAP.get(id)!).filter(Boolean)
  );
}
