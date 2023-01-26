/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '@instantsearch/mocks';
import instantsearch from '../../../index.es';
import { wait } from '@instantsearch/testutils/wait';
import clearRefinements from '../clear-refinements';
import refinementList from '../../refinement-list/refinement-list';
import { fireEvent, within } from '@testing-library/dom';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('clearRefinements', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        },
      });

      search.addWidgets([
        refinementList({
          container: document.createElement('div'),
          attribute: 'brand',
        }),
        clearRefinements({ container }),
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
    class="ais-ClearRefinements"
  >
    <button
      class="ais-ClearRefinements-button"
    >
      Clear refinements
    </button>
  </div>
</div>
`);

      fireEvent.click(within(container).getByRole('button'));

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-ClearRefinements"
  >
    <button
      class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
      disabled=""
    >
      Clear refinements
    </button>
  </div>
</div>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        },
      });

      search.addWidgets([
        refinementList({
          container: document.createElement('div'),
          attribute: 'brand',
        }),
        clearRefinements({
          container,
          templates: {
            resetLabel({ hasRefinements }, { html }) {
              return html`<span
                >${hasRefinements
                  ? 'Clear refinements'
                  : 'No refinements'}</span
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
    class="ais-ClearRefinements"
  >
    <button
      class="ais-ClearRefinements-button"
    >
      <span>
        Clear refinements
      </span>
    </button>
  </div>
</div>
`);

      fireEvent.click(within(container).getByRole('button'));

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-ClearRefinements"
  >
    <button
      class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
      disabled=""
    >
      <span>
        No refinements
      </span>
    </button>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        initialUiState: {
          indexName: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        },
      });

      search.addWidgets([
        refinementList({
          container: document.createElement('div'),
          attribute: 'brand',
        }),
        clearRefinements({
          container,
          templates: {
            resetLabel({ hasRefinements }) {
              return (
                <span>
                  {hasRefinements ? 'Clear refinements' : 'No refinements'}
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
    class="ais-ClearRefinements"
  >
    <button
      class="ais-ClearRefinements-button"
    >
      <span>
        Clear refinements
      </span>
    </button>
  </div>
</div>
`);

      fireEvent.click(within(container).getByRole('button'));

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-ClearRefinements"
  >
    <button
      class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled"
      disabled=""
    >
      <span>
        No refinements
      </span>
    </button>
  </div>
</div>
`);
    });
  });
});
