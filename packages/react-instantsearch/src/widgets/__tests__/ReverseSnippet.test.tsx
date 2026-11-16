/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render } from '@testing-library/react';
import React from 'react';

import { ReverseSnippet } from '../ReverseSnippet';

describe('ReverseSnippet', () => {
  test('renders single match with inverted highlighting', () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: 'test',
          _snippetResult: {
            data: {
              matchLevel: 'partial',
              value: '__ais-highlight__te__/ais-highlight__st',
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

  test('inverts the highlighting on a single match', () => {
    const { container } = render(
      <ReverseSnippet
        hit={{
          objectID: '1',
          __position: 1,
          data: 'test',
          _snippetResult: {
            data: {
              matchLevel: 'partial',
              // `te` is the matched (normally highlighted) part, `st` is not.
              value: '__ais-highlight__te__/ais-highlight__st',
            },
          },
        }}
        attribute="data"
      />
    );

    const highlighted = container.querySelector(
      '.ais-ReverseSnippet-highlighted'
    );
    const nonHighlighted = container.querySelector(
      '.ais-ReverseSnippet-nonHighlighted'
    );

    // The non-matched text (`st`) is now the highlighted one.
    expect(highlighted).not.toBeNull();
    expect(highlighted!.tagName).toBe('MARK');
    expect(highlighted).toHaveTextContent('st');
    expect(highlighted).not.toHaveTextContent('te');

    // The matched text (`te`) is now the non-highlighted one.
    expect(nonHighlighted).not.toBeNull();
    expect(nonHighlighted!.tagName).toBe('SPAN');
    expect(nonHighlighted).toHaveTextContent('te');
    expect(nonHighlighted).not.toHaveTextContent('st');
  });

  test('inverts the highlighting on a list of matches', () => {
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
                value: '__ais-highlight__te__/ais-highlight__st',
              },
              { matchLevel: 'none', value: 'nothing' },
            ],
          },
        }}
        attribute="data"
      />
    );

    const highlighted = Array.from(
      container.querySelectorAll('.ais-ReverseSnippet-highlighted')
    ).map((element) => element.textContent);
    const nonHighlighted = Array.from(
      container.querySelectorAll('.ais-ReverseSnippet-nonHighlighted')
    ).map((element) => element.textContent);

    // Everything not matched (`st` and the whole `nothing` value) is highlighted.
    expect(highlighted).toEqual(['st', 'nothing']);
    // The only matched text (`te`) is not.
    expect(nonHighlighted).toEqual(['te']);
    expect(
      container.querySelector('.ais-ReverseSnippet-separator')
    ).not.toBeNull();
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
                value: '__ais-highlight__te__/ais-highlight__st',
              },
            },
          },
        }}
        // @ts-expect-error TypeScript type does not accept string, as a way to discourage it
        attribute="data.subdata"
      />
    );

    expect(
      container.querySelector('.ais-ReverseSnippet-highlighted')
    ).toHaveTextContent('st');
    expect(
      container.querySelector('.ais-ReverseSnippet-nonHighlighted')
    ).toHaveTextContent('te');
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
                value: '__ais-highlight__te__/ais-highlight__st',
              },
            },
          },
        }}
        attribute={['data', 'subdata']}
      />
    );

    expect(
      container.querySelector('.ais-ReverseSnippet-highlighted')
    ).toHaveTextContent('st');
    expect(
      container.querySelector('.ais-ReverseSnippet-nonHighlighted')
    ).toHaveTextContent('te');
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

    const root = container.querySelector('.ais-ReverseSnippet');
    expect(root).not.toBeNull();
    expect(root).toBeEmptyDOMElement();
    expect(
      container.querySelector('.ais-ReverseSnippet-highlighted')
    ).toBeNull();
    expect(
      container.querySelector('.ais-ReverseSnippet-nonHighlighted')
    ).toBeNull();
  });

  test('renders html from the record as text', () => {
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
                '__ais-highlight__don__/ais-highlight__\'t <script>alert("xss");</script>',
            },
          },
        }}
        attribute="data"
      />
    );

    // The markup from the record stays inert text.
    expect(container.querySelector('script')).toBeNull();

    // The matched word (`don`) is non-highlighted, the rest (incl. the markup) is.
    expect(
      container.querySelector('.ais-ReverseSnippet-nonHighlighted')
    ).toHaveTextContent('don');
    const highlighted = container.querySelector(
      '.ais-ReverseSnippet-highlighted'
    );
    expect(highlighted).toHaveTextContent('script');
    expect(highlighted!.querySelector('script')).toBeNull();
  });

  test('forwards tag names and separator', () => {
    function Highlighted({ children }: { children: React.ReactNode }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }: { children: React.ReactNode }) {
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
                value: '__ais-highlight__it__/ais-highlight__em1',
              },
              { matchLevel: 'none', value: 'item2' },
            ],
          },
        }}
        attribute="array"
      />
    );

    // With the inversion, `it` (matched) renders with the non-highlighted tag.
    const small = Array.from(container.querySelectorAll('small')).map(
      (element) => element.textContent
    );
    expect(small).toContain('it');

    // ...and the non-matched `em1` renders with the highlighted tag.
    const strong = Array.from(container.querySelectorAll('strong')).map(
      (element) => element.textContent
    );
    expect(strong).toContain('em1');

    expect(
      container.querySelector('.ais-ReverseSnippet-separator')
    ).not.toBeNull();
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <ReverseSnippet
        className="MyReverseSnippet"
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
    expect(root).toHaveClass('ais-ReverseSnippet', 'MyReverseSnippet', 'ROOT');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });
});
