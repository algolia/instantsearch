import { render } from '@testing-library/react';
import React from 'react';

import { Highlight } from '../Highlight';

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

  test('forwards `className` and root props', () => {
    const { container } = render(
      <Highlight
        className="custom-className"
        classNames={{
          root: 'custom-rootClass',
        }}
        hidden={true}
        hit={{
          objectID: '1',
          __position: 1,
        }}
        attribute="objectID"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight custom-rootClass custom-className"
          hidden=""
        />
      </div>
    `);
  });

  test('forwards `classNames`', () => {
    const { container } = render(
      <Highlight
        classNames={{
          root: 'custom-rootclass',
        }}
        hit={{
          objectID: '1',
          __position: 1,
        }}
        attribute="objectID"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ais-Highlight custom-rootclass"
        />
      </div>
    `);
  });

  test('forwards tag names and separator', () => {
    function Highlighted({ children }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }) {
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
});
