/**
 * @jest-environment jsdom
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { fireEvent, within } from '@testing-library/dom';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import numericMenu from '../numeric-menu';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('numericMenu', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        numericMenu({
          container,
          attribute: 'price',
          items: [
            { label: 'All' },
            { label: 'Less than 500$', end: 500 },
            { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
            { label: 'More than 1000$', start: 1000 },
          ],
        }),
      ]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-NumericMenu"
  >
    <ul
      class="ais-NumericMenu-list"
    >
      <li
        class="ais-NumericMenu-item ais-NumericMenu-item--selected"
      >
        <div>
          <label
            class="ais-NumericMenu-label"
          >
            <input
              checked=""
              class="ais-NumericMenu-radio"
              name="price"
              type="radio"
            />
            <span
              class="ais-NumericMenu-labelText"
            >
              All
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label
            class="ais-NumericMenu-label"
          >
            <input
              class="ais-NumericMenu-radio"
              name="price"
              type="radio"
            />
            <span
              class="ais-NumericMenu-labelText"
            >
              Less than 500$
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label
            class="ais-NumericMenu-label"
          >
            <input
              class="ais-NumericMenu-radio"
              name="price"
              type="radio"
            />
            <span
              class="ais-NumericMenu-labelText"
            >
              Between 500$ - 1000$
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label
            class="ais-NumericMenu-label"
          >
            <input
              class="ais-NumericMenu-radio"
              name="price"
              type="radio"
            />
            <span
              class="ais-NumericMenu-labelText"
            >
              More than 1000$
            </span>
          </label>
        </div>
      </li>
    </ul>
  </div>
</div>
`);

      const [firstRadioInput, secondRadioInput] =
        within(container).getAllByRole('radio');

      fireEvent.click(secondRadioInput);

      await wait(0);

      expect(firstRadioInput).not.toBeChecked();
      expect(secondRadioInput).toBeChecked();
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        numericMenu({
          container,
          attribute: 'price',
          items: [
            { label: 'All' },
            { label: 'Less than 500$', end: 500 },
            { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
            { label: 'More than 1000$', start: 1000 },
          ],
          templates: {
            item({ label, attribute, isRefined }, { html }) {
              return html`<label>
                <input
                  type="radio"
                  name="${attribute}"
                  defaultChecked="${isRefined}"
                />
                <span>${label}</span>
              </label>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-NumericMenu"
  >
    <ul
      class="ais-NumericMenu-list"
    >
      <li
        class="ais-NumericMenu-item ais-NumericMenu-item--selected"
      >
        <div>
          <label>
            <input
              checked=""
              name="price"
              type="radio"
            />
            <span>
              All
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label>
            <input
              name="price"
              type="radio"
            />
            <span>
              Less than 500$
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label>
            <input
              name="price"
              type="radio"
            />
            <span>
              Between 500$ - 1000$
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label>
            <input
              name="price"
              type="radio"
            />
            <span>
              More than 1000$
            </span>
          </label>
        </div>
      </li>
    </ul>
  </div>
</div>
`);

      const [firstRadioInput, secondRadioInput] =
        within(container).getAllByRole('radio');

      fireEvent.click(secondRadioInput);

      await wait(0);

      expect(firstRadioInput).not.toBeChecked();
      expect(secondRadioInput).toBeChecked();
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        numericMenu({
          container,
          attribute: 'price',
          items: [
            { label: 'All' },
            { label: 'Less than 500$', end: 500 },
            { label: 'Between 500$ - 1000$', start: 500, end: 1000 },
            { label: 'More than 1000$', start: 1000 },
          ],
          templates: {
            item({ label, attribute, isRefined }) {
              return (
                <label>
                  <input
                    type="radio"
                    name={attribute}
                    defaultChecked={isRefined}
                  />
                  <span>{label}</span>
                </label>
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
    class="ais-NumericMenu"
  >
    <ul
      class="ais-NumericMenu-list"
    >
      <li
        class="ais-NumericMenu-item ais-NumericMenu-item--selected"
      >
        <div>
          <label>
            <input
              checked=""
              name="price"
              type="radio"
            />
            <span>
              All
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label>
            <input
              name="price"
              type="radio"
            />
            <span>
              Less than 500$
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label>
            <input
              name="price"
              type="radio"
            />
            <span>
              Between 500$ - 1000$
            </span>
          </label>
        </div>
      </li>
      <li
        class="ais-NumericMenu-item"
      >
        <div>
          <label>
            <input
              name="price"
              type="radio"
            />
            <span>
              More than 1000$
            </span>
          </label>
        </div>
      </li>
    </ul>
  </div>
</div>
`);

      const [firstRadioInput, secondRadioInput] =
        within(container).getAllByRole('radio');

      fireEvent.click(secondRadioInput);

      await wait(0);

      expect(firstRadioInput).not.toBeChecked();
      expect(secondRadioInput).toBeChecked();
    });

    function createMockedSearchClient() {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) => {
                return createSingleSearchResponse<any>({
                  index: request.indexName,
                  hits: [
                    {
                      objectID: '1',
                      name: 'iPhone 13',
                      price: 999,
                    },
                    {
                      objectID: '2',
                      name: 'Galaxy Z Fold4',
                      price: 569,
                    },
                  ],
                });
              })
            )
          );
        }),
      });
    }
  });
});
