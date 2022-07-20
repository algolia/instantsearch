/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import InfiniteHits, { InfiniteHitsProps } from '../InfiniteHits';
import type { Hits, SearchResponse } from '../../../types';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { TAG_REPLACEMENT } from '../../../lib/utils';

function createResults(partialResults: Partial<SearchResponse<any>>) {
  return new SearchResults(new SearchParameters(), [
    createSingleSearchResponse(partialResults),
  ]);
}

describe('InfiniteHits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
    loadPrevious: 'loadPrevious',
    disabledLoadPrevious: 'disabledLoadPrevious',
    loadMore: 'loadMore',
    disabledLoadMore: 'disabledLoadMore',
  };

  const sendEvent = () => {};
  const bindEvent = () => '';

  describe('markup', () => {
    it('should render <InfiniteHits /> on first page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> on last page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on first page', () => {
      const hits: Hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on last page', () => {
      const hits: Hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> with "Show previous" button on first page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      const previousButton = container.querySelector('.loadPrevious');

      expect(previousButton).toBeInTheDocument();
      expect(previousButton).toHaveClass('disabledLoadPrevious');
      expect(previousButton).toBeDisabled();
      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> with "Show previous" button on last page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      const previousButton = container.querySelector('.loadPrevious');

      expect(previousButton).toBeInTheDocument();
      expect(previousButton).not.toHaveClass('disabledLoadPrevious');
      expect(previousButton).not.toBeDisabled();
      expect(container).toMatchSnapshot();
    });

    it('renders component with custom `html` templates (with hits)', () => {
      const hits = [
        {
          objectID: '1',
          name: 'Apple iPhone smartphone',
          description: 'A smartphone by Apple.',
          _highlightResult: {
            name: {
              value: `Apple iPhone ${TAG_REPLACEMENT.highlightPreTag}smartphone`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          _snippetResult: {
            description: {
              value: `A ${TAG_REPLACEMENT.highlightPreTag}smartphone${TAG_REPLACEMENT.highlightPostTag} by Apple.`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          __position: 1,
        },
        {
          objectID: '2',
          name: 'Samsung Galaxy smartphone',
          description: 'A smartphone by Samsung.',
          _highlightResult: {
            name: {
              value: `Samsung Galaxy ${TAG_REPLACEMENT.highlightPreTag}smartphone${TAG_REPLACEMENT.highlightPostTag}`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          _snippetResult: {
            description: {
              value: `A ${TAG_REPLACEMENT.highlightPreTag}smartphone${TAG_REPLACEMENT.highlightPostTag} by Samsung.`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          __position: 2,
        },
      ];

      const props: InfiniteHitsProps = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({ hits, query: 'smartphone', page: 2 }),
        ]),
        hits,
        templateProps: {
          templates: {
            empty: '',
            showPreviousText: '',
            showMoreText: '',
            item: '',
          },
        },
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        isFirstPage: false,
        isLastPage: false,
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(
        <InfiniteHits
          {...props}
          templateProps={{
            ...props.templateProps,
            templates: {
              empty({ query }, { html }) {
                return html`<p>No results for <q>${query}</q></p>`;
              },
              item(hit, { html, components }) {
                return html`
                  <h2>${components.Highlight({ hit, attribute: 'name' })}</h2>
                  <h3>
                    ${components.ReverseHighlight({ hit, attribute: 'name' })}
                  </h3>
                  <p>
                    ${components.Snippet({ hit, attribute: 'description' })}
                  </p>
                  <p>
                    ${components.ReverseSnippet({
                      hit,
                      attribute: 'description',
                    })}
                  </p>
                `;
              },
              showPreviousText() {
                return '<span>Show previous</span>';
              },
              showMoreText() {
                return '<span>Show more</span>';
              },
            },
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <button
      class="loadPrevious"
    >
      <span>
        Show previous
      </span>
    </button>
    <ol
      class="list"
    >
      <li
        class="item"
      >
        <h2>
          <span
            class="ais-Highlight"
          >
            <span
              class="ais-Highlight-nonHighlighted"
            >
              Apple iPhone 
            </span>
            <mark
              class="ais-Highlight-highlighted"
            >
              smartphone
            </mark>
            <span
              class="ais-Highlight-nonHighlighted"
            />
          </span>
        </h2>
        <h3>
          <span
            class="ais-ReverseHighlight"
          >
            <mark
              class="ais-ReverseHighlight-highlighted"
            >
              Apple iPhone 
            </mark>
            <span
              class="ais-ReverseHighlight-nonHighlighted"
            >
              smartphone
            </span>
            <mark
              class="ais-ReverseHighlight-highlighted"
            />
          </span>
        </h3>
        <p>
          <span
            class="ais-Snippet"
          >
            <span
              class="ais-Snippet-nonHighlighted"
            >
              A 
            </span>
            <mark
              class="ais-Snippet-highlighted"
            >
              smartphone
            </mark>
            <span
              class="ais-Snippet-nonHighlighted"
            >
               by Apple.
            </span>
          </span>
        </p>
        <p>
          <span
            class="ais-ReverseSnippet"
          >
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
              A 
            </mark>
            <span
              class="ais-ReverseSnippet-nonHighlighted"
            >
              smartphone
            </span>
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
               by Apple.
            </mark>
          </span>
        </p>
      </li>
      <li
        class="item"
      >
        <h2>
          <span
            class="ais-Highlight"
          >
            <span
              class="ais-Highlight-nonHighlighted"
            >
              Samsung Galaxy 
            </span>
            <mark
              class="ais-Highlight-highlighted"
            >
              smartphone
            </mark>
          </span>
        </h2>
        <h3>
          <span
            class="ais-ReverseHighlight"
          >
            <mark
              class="ais-ReverseHighlight-highlighted"
            >
              Samsung Galaxy 
            </mark>
            <span
              class="ais-ReverseHighlight-nonHighlighted"
            >
              smartphone
            </span>
          </span>
        </h3>
        <p>
          <span
            class="ais-Snippet"
          >
            <span
              class="ais-Snippet-nonHighlighted"
            >
              A 
            </span>
            <mark
              class="ais-Snippet-highlighted"
            >
              smartphone
            </mark>
            <span
              class="ais-Snippet-nonHighlighted"
            >
               by Samsung.
            </span>
          </span>
        </p>
        <p>
          <span
            class="ais-ReverseSnippet"
          >
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
              A 
            </mark>
            <span
              class="ais-ReverseSnippet-nonHighlighted"
            >
              smartphone
            </span>
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
               by Samsung.
            </mark>
          </span>
        </p>
      </li>
    </ol>
    <button
      class="loadMore"
    >
      <span>
        Show more
      </span>
    </button>
  </div>
</div>
`);
    });

    it('renders component with custom `html` templates (without hits)', () => {
      const props: InfiniteHitsProps = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({ hits: [], query: 'smartphone' }),
        ]),
        hits: [],
        templateProps: {
          templates: {
            empty: '',
            showPreviousText: '',
            showMoreText: '',
            item: '',
          },
        },
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        isFirstPage: true,
        isLastPage: false,
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(
        <InfiniteHits
          {...props}
          templateProps={{
            ...props.templateProps,
            templates: {
              empty({ query }, { html }) {
                return html`<p>No results for <q>${query}</q></p>`;
              },
              item(hit, { html }) {
                return html`<pre>${JSON.stringify(hit)}</pre>`;
              },
              showPreviousText() {
                return '<span>Show previous</span>';
              },
              showMoreText() {
                return '<span>Show more</span>';
              },
            },
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root emptyRoot"
  >
    <p>
      No results for 
      <q>
        smartphone
      </q>
    </p>
  </div>
</div>
`);
    });
  });
});
