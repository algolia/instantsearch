/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import toggleRefinement from '../toggle-refinement';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('toggleRefinement', () => {
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
