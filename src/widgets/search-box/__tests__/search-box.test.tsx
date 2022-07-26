/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import searchBox from '../search-box';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('searchBox', () => {
  describe('templates', () => {
    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({
          container,
          templates: {
            submit({ cssClasses }, { html }) {
              return html`<span class="${cssClasses.submitIcon}">Submit</span>`;
            },
            reset({ cssClasses }, { html }) {
              return html`<span class="${cssClasses.resetIcon}">Reset</span>`;
            },
            loadingIndicator({ cssClasses }, { html }) {
              return html`<span class="${cssClasses.loadingIcon}">Wait…</span>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-SearchBox"
  >
    <form
      action=""
      class="ais-SearchBox-form"
      novalidate=""
      role="search"
    >
      <input
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        class="ais-SearchBox-input"
        maxlength="512"
        placeholder=""
        spellcheck="false"
        type="search"
      />
      <button
        class="ais-SearchBox-submit"
        title="Submit the search query."
        type="submit"
      >
        <span
          class="ais-SearchBox-submitIcon"
        >
          Submit
        </span>
      </button>
      <button
        class="ais-SearchBox-reset"
        hidden=""
        title="Clear the search query."
        type="reset"
      >
        <span
          class="ais-SearchBox-resetIcon"
        >
          Reset
        </span>
      </button>
      <span
        class="ais-SearchBox-loadingIndicator"
        hidden=""
      >
        <span
          class="ais-SearchBox-loadingIcon"
        >
          Wait…
        </span>
      </span>
    </form>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        searchBox({
          container,
          templates: {
            submit({ cssClasses }) {
              return <span className={cssClasses.submitIcon}>Submit</span>;
            },
            reset({ cssClasses }) {
              return <span className={cssClasses.resetIcon}>Reset</span>;
            },
            loadingIndicator({ cssClasses }) {
              return <span className={cssClasses.loadingIcon}>Wait…</span>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-SearchBox"
  >
    <form
      action=""
      class="ais-SearchBox-form"
      novalidate=""
      role="search"
    >
      <input
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        class="ais-SearchBox-input"
        maxlength="512"
        placeholder=""
        spellcheck="false"
        type="search"
      />
      <button
        class="ais-SearchBox-submit"
        title="Submit the search query."
        type="submit"
      >
        <span
          class="ais-SearchBox-submitIcon"
        >
          Submit
        </span>
      </button>
      <button
        class="ais-SearchBox-reset"
        hidden=""
        title="Clear the search query."
        type="reset"
      >
        <span
          class="ais-SearchBox-resetIcon"
        >
          Reset
        </span>
      </button>
      <span
        class="ais-SearchBox-loadingIndicator"
        hidden=""
      >
        <span
          class="ais-SearchBox-loadingIcon"
        >
          Wait…
        </span>
      </span>
    </form>
  </div>
</div>
`);
    });
  });
});
