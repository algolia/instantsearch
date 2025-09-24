/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { render } from '@testing-library/preact';
import { h } from 'preact';

import { Highlight } from '../Highlight';

import type { ComponentChildren } from 'instantsearch-ui-components';

describe('Highlight', () => {
  test('renders single match', () => {
    const { container } = render(
      <Highlight
        hit={{
          objectID: '1',
          __position: 1,
          data: 'test',
          _highlightResult: {
            data: {
              matchedWords: ['test'],
              matchLevel: 'partial',
              value: '<mark>te</mark>st',
            },
          },
        }}
        attribute="data"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        >
          <mark
            class="ais-Highlight-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            st
          </span>
        </span>
      </div>
    `);
  });

  test('renders list of matches', () => {
    const { container } = render(
      <Highlight
        hit={{
          objectID: '1',
          __position: 1,
          data: ['test', 'nothing'],
          _highlightResult: {
            data: [
              {
                matchedWords: ['test'],
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
              { matchedWords: [], matchLevel: 'none', value: 'nothing' },
            ],
          },
        }}
        attribute="data"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        >
          <mark
            class="ais-Highlight-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            st
          </span>
          <span
            class="ais-Highlight-separator"
          >
            ,
          </span>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('renders path to match', () => {
    const { container } = render(
      <Highlight
        hit={{
          objectID: '1',
          __position: 1,
          data: { subdata: 'test' },
          _highlightResult: {
            data: {
              subdata: {
                matchedWords: ['test'],
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
            },
          },
        }}
        // @ts-expect-error TypeScript type does not accept string, as a way to discourage it
        attribute="data.subdata"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        >
          <mark
            class="ais-Highlight-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            st
          </span>
        </span>
      </div>
    `);
  });

  test('renders path to match as array', () => {
    const { container } = render(
      <Highlight
        hit={{
          objectID: '1',
          __position: 1,
          data: { subdata: 'test' },
          _highlightResult: {
            data: {
              subdata: {
                matchedWords: ['test'],
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
            },
          },
        }}
        attribute={['data', 'subdata']}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        >
          <mark
            class="ais-Highlight-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            st
          </span>
        </span>
      </div>
    `);
  });

  test("renders nothing when there's no match", () => {
    const { container } = render(
      <Highlight
        hit={{
          objectID: '1',
          __position: 1,
        }}
        // @ts-expect-error TypeScript doesn't allow an attribute which doesn't exist
        attribute="something-that-doesnt-exist"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        />
      </div>
    `);
  });

  test("doesn't render html escaped content", () => {
    const { container } = render(
      <Highlight
        hit={{
          objectID: '1',
          __position: 1,
          data: 'test',
          _highlightResult: {
            data: {
              matchedWords: ["don't"],
              matchLevel: 'partial',
              value:
                '<mark>don</mark>&#39;t &lt;script&gt;alert(&quot;xss&quot;);&lt;/script&gt;',
            },
          },
        }}
        attribute="data"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        >
          <mark
            class="ais-Highlight-highlighted"
          >
            don
          </mark>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            't &lt;script&gt;alert("xss");&lt;/script&gt;
          </span>
        </span>
      </div>
    `);
  });

  test('forwards tag names and separator', () => {
    function Highlighted({ children }: { children: ComponentChildren }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }: { children: ComponentChildren }) {
      return <small>{children}</small>;
    }

    const { container } = render(
      <Highlight
        highlightedTagName={Highlighted}
        nonHighlightedTagName={NonHighlighted}
        separator={<strong> - </strong>}
        hit={{
          objectID: '1',
          __position: 1,
          array: ['item1', 'item2'],
          _highlightResult: {
            array: [
              {
                matchLevel: 'partial',
                matchedWords: [],
                value: '<mark>it</mark>em1',
              },
              { matchLevel: 'none', matchedWords: [], value: 'item2' },
            ],
          },
        }}
        attribute="array"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight"
        >
          <strong>
            it
          </strong>
          <small>
            em1
          </small>
          <span
            class="ais-Highlight-separator"
          >
            <strong>
               -
            </strong>
          </span>
          <small>
            item2
          </small>
        </span>
      </div>
    `);
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <Highlight
        className="MyHighlight"
        cssClasses={{ root: 'ROOT' }}
        aria-hidden={true}
        hit={{
          objectID: '1',
          __position: 1,
        }}
        attribute="objectID"
      />
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyHighlight', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  test('warns if attribute does not exist', () => {
    expect(() => {
      render(
        <Highlight
          hit={{
            objectID: '1',
            __position: 1,
            data: 'test',
            _highlightResult: {
              data: {
                matchedWords: ['test'],
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
            },
          }}
          // @ts-expect-error
          attribute="does.not.exist"
        />
      );
    })
      .toWarnDev(`[InstantSearch.js]: Could not enable highlight for "does.not.exist", will display an empty string.
Please check whether this attribute exists and is either searchable or specified in \`attributesToHighlight\`.

See: https://alg.li/highlighting`);
  });

  test('warns if attribute does not have highlighting', () => {
    expect(() => {
      render(
        <Highlight
          hit={{
            objectID: '1',
            __position: 1,
            data: 'test',
            title: 'title',
            _highlightResult: {
              data: {
                matchedWords: ['test'],
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
            },
          }}
          attribute="title"
        />
      );
    })
      .toWarnDev(`[InstantSearch.js]: Could not enable highlight for "title", will display an empty string.
Please check whether this attribute exists and is either searchable or specified in \`attributesToHighlight\`.

See: https://alg.li/highlighting`);
  });
});
