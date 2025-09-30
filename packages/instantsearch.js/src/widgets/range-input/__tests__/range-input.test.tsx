/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import rangeInput from '../range-input';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('rangeInput', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        // @ts-expect-error
        rangeInput({});
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/"
      `);
    });

    test('add custom CSS classes', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      });

      search.addWidgets([
        rangeInput({
          container,
          attribute: 'price',
          cssClasses: {
            root: 'ROOT',
            form: 'FORM',
            label: 'LABEL',
            input: 'INPUT',
            inputMin: 'INPUT_MIN',
            inputMax: 'INPUT_MAX',
            separator: 'SEPARATOR',
            submit: 'SUBMIT',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.firstChild).toHaveClass('ROOT');
      expect(container.querySelector('.ais-RangeInput-form')).toHaveClass(
        'FORM'
      );
      expect(container.querySelector('.ais-RangeInput-label')).toHaveClass(
        'LABEL'
      );
      [...container.querySelectorAll('.ais-RangeInput-input')].forEach(
        (input) => expect(input).toHaveClass('INPUT')
      );
      expect(container.querySelector('.ais-RangeInput-input--min')).toHaveClass(
        'INPUT_MIN'
      );
      expect(container.querySelector('.ais-RangeInput-input--max')).toHaveClass(
        'INPUT_MAX'
      );
      expect(container.querySelector('.ais-RangeInput-separator')).toHaveClass(
        'SEPARATOR'
      );
      expect(container.querySelector('.ais-RangeInput-submit')).toHaveClass(
        'SUBMIT'
      );
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([rangeInput({ container, attribute: 'price' })]);

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
            class="ais-RangeInput ais-RangeInput--noRefinement"
          >
            <form
              class="ais-RangeInput-form"
            >
              <label
                class="ais-RangeInput-label"
              >
                <input
                  class="ais-RangeInput-input ais-RangeInput-input--min"
                  max="1000"
                  min="1"
                  placeholder="1"
                  step="1"
                  type="number"
                />
              </label>
              <span
                class="ais-RangeInput-separator"
              >
                to
              </span>
              <label
                class="ais-RangeInput-label"
              >
                <input
                  class="ais-RangeInput-input ais-RangeInput-input--max"
                  max="1000"
                  min="1"
                  placeholder="1000"
                  step="1"
                  type="number"
                />
              </label>
              <button
                class="ais-RangeInput-submit"
                type="submit"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        rangeInput({
          container,
          attribute: 'price',
          templates: {
            separatorText(_, { html }) {
              return html`<span>to</span>`;
            },
            submitText(_, { html }) {
              return html`<span>Go</span>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-RangeInput ais-RangeInput--noRefinement"
          >
            <form
              class="ais-RangeInput-form"
            >
              <label
                class="ais-RangeInput-label"
              >
                <input
                  class="ais-RangeInput-input ais-RangeInput-input--min"
                  max="1000"
                  min="1"
                  placeholder="1"
                  step="1"
                  type="number"
                />
              </label>
              <span
                class="ais-RangeInput-separator"
              >
                <span>
                  to
                </span>
              </span>
              <label
                class="ais-RangeInput-label"
              >
                <input
                  class="ais-RangeInput-input ais-RangeInput-input--max"
                  max="1000"
                  min="1"
                  placeholder="1000"
                  step="1"
                  type="number"
                />
              </label>
              <button
                class="ais-RangeInput-submit"
                type="submit"
              >
                <span>
                  Go
                </span>
              </button>
            </form>
          </div>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        rangeInput({
          container,
          attribute: 'price',
          templates: {
            separatorText() {
              return <span>to</span>;
            },
            submitText() {
              return <span>Go</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-RangeInput ais-RangeInput--noRefinement"
          >
            <form
              class="ais-RangeInput-form"
            >
              <label
                class="ais-RangeInput-label"
              >
                <input
                  class="ais-RangeInput-input ais-RangeInput-input--min"
                  max="1000"
                  min="1"
                  placeholder="1"
                  step="1"
                  type="number"
                />
              </label>
              <span
                class="ais-RangeInput-separator"
              >
                <span>
                  to
                </span>
              </span>
              <label
                class="ais-RangeInput-label"
              >
                <input
                  class="ais-RangeInput-input ais-RangeInput-input--max"
                  max="1000"
                  min="1"
                  placeholder="1000"
                  step="1"
                  type="number"
                />
              </label>
              <button
                class="ais-RangeInput-submit"
                type="submit"
              >
                <span>
                  Go
                </span>
              </button>
            </form>
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
                  facets: { price: {} },
                  facets_stats: {
                    price: { min: 1, max: 1000, avg: 0, sum: 0 },
                  },
                })
              )
            )
          )
        ),
      });
    }
  });
});
