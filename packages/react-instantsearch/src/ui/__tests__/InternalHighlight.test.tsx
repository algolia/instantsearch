/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';

import { InternalHighlight } from '../InternalHighlight';

import type { InternalHighlightProps } from '../InternalHighlight';

describe('Highlight', () => {
  test('renders only wrapper with empty match', () => {
    const { container } = render(
      <InternalHighlight
        classNames={{
          root: 'ROOT',
          highlighted: 'HIGHLIGHTED',
          nonHighlighted: 'NON-HIGHLIGHTED',
          separator: 'SEPARATOR',
        }}
        parts={[]}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ROOT"
        />
      </div>
    `);
  });

  test('renders parts', () => {
    const { container } = render(
      <InternalHighlight
        classNames={{
          root: 'ROOT',
          highlighted: 'HIGHLIGHTED',
          nonHighlighted: 'NON-HIGHLIGHTED',
          separator: 'SEPARATOR',
        }}
        parts={[
          [
            { isHighlighted: true, value: 'te' },
            { isHighlighted: false, value: 'st' },
          ],
          [{ isHighlighted: false, value: 'nothing' }],
        ]}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ROOT"
        >
          <mark
            class="HIGHLIGHTED"
          >
            te
          </mark>
          <span
            class="NON-HIGHLIGHTED"
          >
            st
          </span>
          <span
            class="SEPARATOR"
          >
            , 
          </span>
          <span
            class="NON-HIGHLIGHTED"
          >
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('renders with custom tag names and separator', () => {
    function Highlighted({ children }: { children: React.ReactNode }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }: { children: React.ReactNode }) {
      return <small>{children}</small>;
    }

    const { container } = render(
      <InternalHighlight
        classNames={{
          root: 'ROOT',
          highlighted: 'HIGHLIGHTED',
          nonHighlighted: 'NON-HIGHLIGHTED',
          separator: 'SEPARATOR',
        }}
        highlightedTagName={Highlighted}
        nonHighlightedTagName={NonHighlighted}
        separator={<strong> - </strong>}
        parts={[
          [
            { isHighlighted: true, value: 'te' },
            { isHighlighted: false, value: 'st' },
          ],
          [{ isHighlighted: false, value: 'nothing' }],
        ]}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ROOT"
        >
          <strong>
            te
          </strong>
          <small>
            st
          </small>
          <span
            class="SEPARATOR"
          >
            <strong>
               - 
            </strong>
          </span>
          <small>
            nothing
          </small>
        </span>
      </div>
    `);
  });

  test('accepts custom class names', () => {
    const props: InternalHighlightProps = {
      parts: [
        [
          { isHighlighted: true, value: 'te' },
          { isHighlighted: false, value: 'st' },
        ],
        [{ isHighlighted: false, value: 'nothing' }],
      ],
      className: 'MyCustomInternalHighlight',
      classNames: {
        root: 'ROOT',
        highlighted: 'HIGHLIGHTED',
        nonHighlighted: 'NON-HIGHLIGHTED',
        separator: 'SEPARATOR',
      },
    };
    const { container } = render(<InternalHighlight {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ROOT MyCustomInternalHighlight"
        >
          <mark
            class="HIGHLIGHTED"
          >
            te
          </mark>
          <span
            class="NON-HIGHLIGHTED"
          >
            st
          </span>
          <span
            class="SEPARATOR"
          >
            , 
          </span>
          <span
            class="NON-HIGHLIGHTED"
          >
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <InternalHighlight
        parts={[]}
        classNames={{
          root: 'ROOT',
          highlighted: 'HIGHLIGHTED',
          nonHighlighted: 'NON-HIGHLIGHTED',
          separator: 'SEPARATOR',
        }}
        aria-hidden="true"
      />
    );

    expect(container.querySelector('.ROOT')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });
});
