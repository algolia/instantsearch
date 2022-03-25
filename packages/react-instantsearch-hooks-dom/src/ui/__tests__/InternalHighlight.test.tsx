import { render } from '@testing-library/react';
import React from 'react';

import { InternalHighlight } from '../InternalHighlight';

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
    function Highlighted({ children }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }) {
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

  test('forwards `className` and root props', () => {
    const { container } = render(
      <InternalHighlight
        classNames={{
          root: 'ROOT',
          highlighted: 'HIGHLIGHTED',
          nonHighlighted: 'NON-HIGHLIGHTED',
          separator: 'SEPARATOR',
        }}
        parts={[]}
        className="custom-root"
        aria-hidden="true"
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          aria-hidden="true"
          class="ROOT custom-root"
        />
      </div>
    `);
  });
});
