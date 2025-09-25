/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import React from 'react';

import { Snippet } from '../Snippet';

describe('Snippet', () => {
  test('renders single match', () => {
    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        >
          <mark
            class="ais-Snippet-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Snippet-nonHighlighted"
          >
            st
          </span>
        </span>
      </div>
    `);
  });

  test('renders list of matches', () => {
    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        >
          <mark
            class="ais-Snippet-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Snippet-nonHighlighted"
          >
            st
          </span>
          <span
            class="ais-Snippet-separator"
          >
            , 
          </span>
          <span
            class="ais-Snippet-nonHighlighted"
          >
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('renders path to match', () => {
    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        >
          <mark
            class="ais-Snippet-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Snippet-nonHighlighted"
          >
            st
          </span>
        </span>
      </div>
    `);
  });

  test('renders path to match as array', () => {
    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        >
          <mark
            class="ais-Snippet-highlighted"
          >
            te
          </mark>
          <span
            class="ais-Snippet-nonHighlighted"
          >
            st
          </span>
        </span>
      </div>
    `);
  });

  test("renders nothing when there's no match", () => {
    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        />
      </div>
    `);
  });

  test("doesn't render html escaped content", () => {
    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        >
          <mark
            class="ais-Snippet-highlighted"
          >
            don
          </mark>
          <span
            class="ais-Snippet-nonHighlighted"
          >
            't &lt;script&gt;alert("xss");&lt;/script&gt;
          </span>
        </span>
      </div>
    `);
  });

  test('forwards tag names and separator', () => {
    function Highlighted({ children }: { children: React.ReactNode }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }: { children: React.ReactNode }) {
      return <small>{children}</small>;
    }

    const { container } = render(
      <Snippet
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
          class="ais-Snippet"
        >
          <strong>
            it
          </strong>
          <small>
            em1
          </small>
          <span
            class="ais-Snippet-separator"
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
      <Snippet
        className="MySnippet"
        classNames={{ root: 'ROOT' }}
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
});
