/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '@instantsearch/mocks/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '@instantsearch/testutils/wait';
import searchBox from '../search-box';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('searchBox', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([searchBox({ container })]);

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
        <svg
          class="ais-SearchBox-submitIcon"
          height="10"
          viewBox="0 0 40 40"
          width="10"
        >
          <path
            d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
          />
        </svg>
      </button>
      <button
        class="ais-SearchBox-reset"
        hidden=""
        title="Clear the search query."
        type="reset"
      >
        <svg
          class="ais-SearchBox-resetIcon"
          height="10"
          viewBox="0 0 20 20"
          width="10"
        >
          <path
            d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
          />
        </svg>
      </button>
      <span
        class="ais-SearchBox-loadingIndicator"
        hidden=""
      >
        <svg
          class="ais-SearchBox-loadingIcon"
          height="16"
          stroke="#444"
          viewBox="0 0 38 38"
          width="16"
        >
          <g
            fill="none"
            fillRule="evenodd"
          >
            <g
              strokeWidth="2"
              transform="translate(1 1)"
            >
              <circle
                cx="18"
                cy="18"
                r="18"
                strokeOpacity=".5"
              />
              <path
                d="M36 18c0-9.94-8.06-18-18-18"
              >
                <animatetransform
                  attributeName="transform"
                  dur="1s"
                  from="0 18 18"
                  repeatCount="indefinite"
                  to="360 18 18"
                  type="rotate"
                />
              </path>
            </g>
          </g>
        </svg>
      </span>
    </form>
  </div>
</div>
`);
    });

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
