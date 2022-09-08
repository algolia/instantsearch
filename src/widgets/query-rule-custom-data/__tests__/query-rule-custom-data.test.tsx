/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import queryRuleCustomData from '../query-rule-custom-data';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('queryRuleCustomData', () => {
  describe('templates', () => {
    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        queryRuleCustomData({
          container,
          templates: {
            default({ items }, { html }) {
              return html`<ul>
                ${items.map(
                  (item) => html`<li key="${item.banner}">${item.banner}</li>`
                )}
              </ul>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-QueryRuleCustomData"
  >
    <ul>
      <li>
        image-1.png
      </li>
      <li>
        image-2.png
      </li>
    </ul>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        queryRuleCustomData({
          container,
          templates: {
            default({ items }) {
              return (
                <ul>
                  {items.map((item) => (
                    <li key={item.banner}>{item.banner}</li>
                  ))}
                </ul>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-QueryRuleCustomData"
  >
    <ul>
      <li>
        image-1.png
      </li>
      <li>
        image-2.png
      </li>
    </ul>
  </div>
</div>
`);
    });

    function createMockedSearchClient() {
      return createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) =>
                createSingleSearchResponse({
                  index: request.indexName,
                  userData: [
                    { banner: 'image-1.png' },
                    { banner: 'image-2.png' },
                  ],
                })
              )
            )
          )
        ),
      });
    }
  });
});
