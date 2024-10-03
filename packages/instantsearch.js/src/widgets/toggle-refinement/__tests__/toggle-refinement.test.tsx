/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import toggleRefinement from '../toggle-refinement';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('toggleRefinement', () => {
  describe('options', () => {
    test('throws without a `container`', () => {
      expect(() => {
        const searchClient = createSearchClient();

        const search = instantsearch({
          indexName: 'indexName',
          searchClient,
        });

        search.addWidgets([
          toggleRefinement({
            // @ts-expect-error
            container: undefined,
          }),
        ]);
      }).toThrowErrorMatchingInlineSnapshot(`
        "The \`container\` option is required.

        See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/"
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
        toggleRefinement({
          container,
          attribute: 'free_shipping',
          cssClasses: {
            root: 'ROOT',
            label: 'LABEL',
            checkbox: 'CHECKBOX',
            labelText: 'LABEL_TEXT',
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container.firstChild).toHaveClass('ROOT');
      expect(
        container.querySelector('.ais-ToggleRefinement-label')
      ).toHaveClass('LABEL');
      expect(
        container.querySelector('.ais-ToggleRefinement-checkbox')
      ).toHaveClass('CHECKBOX');
      expect(
        container.querySelector('.ais-ToggleRefinement-labelText')
      ).toHaveClass('LABEL_TEXT');
    });
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        toggleRefinement({
          container,
          attribute: 'free_shipping',
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-ToggleRefinement"
          >
            <label
              class="ais-ToggleRefinement-label"
            >
              <input
                class="ais-ToggleRefinement-checkbox"
                type="checkbox"
              />
              <span
                class="ais-ToggleRefinement-labelText"
              >
                free_shipping
              </span>
            </label>
          </div>
        </div>
      `);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        toggleRefinement({
          container,
          attribute: 'free_shipping',
          templates: {
            labelText({ count, isRefined }, { html }) {
              return html`<span
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
                >Free shipping ${count !== null && `(${count})`}</span
              >`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-ToggleRefinement"
          >
            <label
              class="ais-ToggleRefinement-label"
            >
              <input
                class="ais-ToggleRefinement-checkbox"
                type="checkbox"
              />
              <span
                class="ais-ToggleRefinement-labelText"
              >
                <span
                  style="font-weight: normal;"
                >
                  Free shipping
                </span>
              </span>
            </label>
          </div>
        </div>
      `);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        toggleRefinement({
          container,
          attribute: 'free_shipping',
          templates: {
            labelText({ count, isRefined }) {
              return (
                <span style={{ fontWeight: isRefined ? 'bold' : 'normal' }}>
                  Free shipping {count !== null && `(${count})`}
                </span>
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
            class="ais-ToggleRefinement"
          >
            <label
              class="ais-ToggleRefinement-label"
            >
              <input
                class="ais-ToggleRefinement-checkbox"
                type="checkbox"
              />
              <span
                class="ais-ToggleRefinement-labelText"
              >
                <span
                  style="font-weight: normal;"
                >
                  Free shipping
                </span>
              </span>
            </label>
          </div>
        </div>
      `);
    });
  });
});
