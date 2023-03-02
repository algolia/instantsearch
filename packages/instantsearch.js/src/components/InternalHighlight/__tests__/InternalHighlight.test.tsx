/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { render } from '@testing-library/preact';
import { h } from 'preact';

import { InternalHighlight } from '../InternalHighlight';

import type { ComponentChildren } from '@algolia/ui-components-shared';

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
    function Highlighted({ children }: { children: ComponentChildren }) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }: { children: ComponentChildren }) {
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
    const { container } = render(
      <InternalHighlight
        {...{
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
        }}
      />
    );

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
