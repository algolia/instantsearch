/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import instantsearch from '../../../index.es';
import { wait } from '@instantsearch/testutils/wait';
import pagination from '../pagination';
import configure from '../../configure/configure';
import type { SearchResponse } from '../../../../src/types';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('pagination', () => {
  describe('templates', () => {
    test('does not warn with default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        configure({ hitsPerPage: 1 }),
        pagination({ container }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);
    });

    type CustomHit = { name: string; description: string };

    function createMockedSearchClient(
      subset: Partial<SearchResponse<CustomHit>> = {}
    ) {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  query: request.params?.query,
                  hits: [
                    {
                      objectID: '1',
                      name: 'Apple iPhone smartphone',
                      description: 'A smartphone by Apple.',
                      _highlightResult: {
                        name: {
                          value: `Apple iPhone <mark>smartphone</mark>`,
                          matchLevel: 'full' as const,
                          matchedWords: ['smartphone'],
                        },
                      },
                      _snippetResult: {
                        name: {
                          value: `Apple iPhone <mark>smartphone</mark>`,
                          matchLevel: 'full' as const,
                        },
                        description: {
                          value: `A <mark>smartphone</mark> by Apple.`,
                          matchLevel: 'full' as const,
                        },
                      },
                    },
                  ],
                  page: 0,
                  nbPages: 3,
                  ...subset,
                });
              })
            )
          );
        }),
      });
    }
  });
});
