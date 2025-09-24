/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { render } from '@testing-library/preact';
import { h } from 'preact';

import { ReverseSnippet } from '../ReverseSnippet';

import type { ComponentChildren } from 'instantsearch-ui-components';

describe('Snippet', () => {
  test('renders single match', () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: 'test',
          _snippetResult: {
            data: {
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
          class="ais-ReverseSnippet"
        >
          <span
            class="ais-ReverseSnippet-nonHighlighted"
          >
            te
          </span>
          <mark
            class="ais-ReverseSnippet-highlighted"
          >
            st
          </mark>
        </span>
      </div>
    `);
  });

  test('renders list of matches', () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: ['test', 'nothing'],
          _snippetResult: {
            data: [
              {
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
              { matchLevel: 'none', value: 'nothing' },
            ],
          },
        }}
        attribute="data"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-ReverseSnippet"
        >
          <span
            class="ais-ReverseSnippet-nonHighlighted"
          >
            te
          </span>
          <mark
            class="ais-ReverseSnippet-highlighted"
          >
            st
          </mark>
          <span
            class="ais-ReverseSnippet-separator"
          >
            ,
          </span>
          <mark
            class="ais-ReverseSnippet-highlighted"
          >
            nothing
          </mark>
        </span>
      </div>
    `);
  });

  test('renders path to match', () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: { subdata: 'test' },
          _snippetResult: {
            data: {
              subdata: {
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
          class="ais-ReverseSnippet"
        >
          <span
            class="ais-ReverseSnippet-nonHighlighted"
          >
            te
          </span>
          <mark
            class="ais-ReverseSnippet-highlighted"
          >
            st
          </mark>
        </span>
      </div>
    `);
  });

  test('renders path to match as array', () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: { subdata: 'test' },
          _snippetResult: {
            data: {
              subdata: {
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
          class="ais-ReverseSnippet"
        >
          <span
            class="ais-ReverseSnippet-nonHighlighted"
          >
            te
          </span>
          <mark
            class="ais-ReverseSnippet-highlighted"
          >
            st
          </mark>
        </span>
      </div>
    `);
  });

  test("renders nothing when there's no match", () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
        }}
        // @ts-expect-error TS doesn't allow an attribute which doesn't exist
        attribute="something-that-doesnt-exist"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-ReverseSnippet"
        />
      </div>
    `);
  });

  test("doesn't render html escaped content", () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: 'test',
          _snippetResult: {
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
          class="ais-ReverseSnippet"
        >
          <span
            class="ais-ReverseSnippet-nonHighlighted"
          >
            don
          </span>
          <mark
            class="ais-ReverseSnippet-highlighted"
          >
            't &lt;script&gt;alert("xss");&lt;/script&gt;
          </mark>
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
      <ReverseSnippet
        highlightedTagName={Highlighted}
        nonHighlightedTagName={NonHighlighted}
        separator={<strong> - </strong>}
        hit={{
          objectID: '1',
          __position: 1,
          array: ['item1', 'item2'],
          _snippetResult: {
            array: [
              {
                matchLevel: 'partial',
                value: '<mark>it</mark>em1',
              },
              { matchLevel: 'none', value: 'item2' },
            ],
          },
        }}
        attribute="array"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-ReverseSnippet"
        >
          <small>
            it
          </small>
          <strong>
            em1
          </strong>
          <span
            class="ais-ReverseSnippet-separator"
          >
            <strong>
               -
            </strong>
          </span>
          <strong>
            item2
          </strong>
        </span>
      </div>
    `);
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <ReverseSnippet
        className="MySnippet"
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
    expect(root).toHaveClass('MySnippet', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  test('warns if attribute does not exist', () => {
    expect(() => {
      render(
        <ReverseSnippet
          hit={{
            objectID: '1',
            __position: 1,
            data: 'test',
            _snippetResult: {
              data: {
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
      .toWarnDev(`[InstantSearch.js]: Could not enable snippet for "does.not.exist", will display an empty string.
Please check whether this attribute exists and is specified in \`attributesToSnippet\`.

See: https://alg.li/highlighting`);
  });

  test('warns if attribute does not have highlighting', () => {
    expect(() => {
      render(
        <ReverseSnippet
          hit={{
            objectID: '1',
            __position: 1,
            data: 'test',
            title: 'title',
            _snippetResult: {
              data: {
                matchLevel: 'partial',
                value: '<mark>te</mark>st',
              },
            },
          }}
          attribute="title"
        />
      );
    })
      .toWarnDev(`[InstantSearch.js]: Could not enable snippet for "title", will display an empty string.
Please check whether this attribute exists and is specified in \`attributesToSnippet\`.

See: https://alg.li/highlighting`);
  });
});
