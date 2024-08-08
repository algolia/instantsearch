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
                  type: 'span',
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
            type: 'span',
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
            type: 'span',
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
            type: 'span',
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
                header: 'brand',
                collapsed: true,
                searchable: true,
              },
            },
            {
              type: 'ais.refinementList',
              parameters: {
                attribute: 'type',
                header: 'type',
                collapsed: true,
                searchable: true,
              },
            },
            {
              type: 'ais.rangeInput',
              parameters: {
                attribute: 'price',
                header: 'price',
                collapsed: true,
              },
            },
            {
              type: 'ais.toggleRefinement',
              parameters: {
                attribute: 'free_shipping',
                header: 'free shipping',
                collapsed: true,
              },
            },
          ],
          [
            {
              type: 'ais.hits',
              parameters: {},
              children: [
                {
                  type: 'link',
                  parameters: { href: [{ type: 'attribute', path: ['url'] }] },
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
                        class: [{ type: 'string', value: '__flex' }],
                      },
                      children: [
                        {
                          type: 'span',
                          parameters: {
                            text: [{ type: 'attribute', path: ['name'] }],
                          },
                        },
                        {
                          type: 'span',
                          parameters: {
                            class: [{ type: 'string', value: '__bold' }],
                            text: [
                              { type: 'string', value: '$' },
                              { type: 'attribute', path: ['price'] },
                            ],
                          },
                        },
                      ],
                    },
                  ],
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
              parameters: {
                limit: 4,
                facetName: 'categories',
                facetValue: 'Audio',
              },
              children: [
                {
                  type: 'link',
                  parameters: { href: [{ type: 'attribute', path: ['url'] }] },
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
                        class: [{ type: 'string', value: '__flex' }],
                      },
                      children: [
                        {
                          type: 'span',
                          parameters: {
                            text: [{ type: 'attribute', path: ['name'] }],
                          },
                        },
                        {
                          type: 'span',
                          parameters: {
                            class: [{ type: 'string', value: '__bold' }],
                            text: [
                              { type: 'string', value: '$' },
                              { type: 'attribute', path: ['price'] },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
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
