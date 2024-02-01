/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createHighlightComponent } from '../Highlight';
import { ComponentChildren } from '../../types';

import type { ComponentChildren } from '../../types';

const Highlight = createHighlightComponent({ createElement, Fragment });

describe('Highlight', () => {
  test('renders only wrapper with empty match', () => {
    const { container } = render(<Highlight parts={[]} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class=""
        />
      </div>
    `);
  });

  test('renders parts', () => {
    const { container } = render(
      <Highlight
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
          class=""
        >
          <mark>
            te
          </mark>
          <span>
            st
          </span>
          <span>
            ,
          </span>
          <span>
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('renders with custom separator', () => {
    const { container } = render(
      <Highlight
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
          class=""
        >
          <mark>
            te
          </mark>
          <span>
            st
          </span>
          <span>
            <strong>
               -
            </strong>
          </span>
          <span>
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('renders with custom tag names as strings', () => {
    const { container } = render(
      <Highlight
        highlightedTagName="strong"
        nonHighlightedTagName="small"
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
          class=""
        >
          <strong>
            te
          </strong>
          <small>
            st
          </small>
          <span>
            ,
          </span>
          <small>
            nothing
          </small>
        </span>
      </div>
    `);
  });

  test('renders with custom tag names as components', () => {
    type PropsWithChildren = {
      children: ComponentChildren;
    };

    function Highlighted({ children }: PropsWithChildren) {
      return <strong>{children}</strong>;
    }
    function NonHighlighted({ children }: PropsWithChildren) {
      return <small>{children}</small>;
    }

    const { container } = render(
      <Highlight
        highlightedTagName={Highlighted}
        nonHighlightedTagName={NonHighlighted}
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
          class=""
        >
          <strong>
            te
          </strong>
          <small>
            st
          </small>
          <span>
            ,
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
      <Highlight
        parts={[
          [
            { isHighlighted: true, value: 'te' },
            { isHighlighted: false, value: 'st' },
          ],
          [{ isHighlighted: false, value: 'nothing' }],
        ]}
        className="MyCustomHighlight"
        classNames={{
          root: 'ROOT',
          highlighted: 'HIGHLIGHTED',
          nonHighlighted: 'NON-HIGHLIGHTED',
          separator: 'SEPARATOR',
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="ROOT MyCustomHighlight"
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

  test('accepts partial custom class names', () => {
    const { container } = render(
      <Highlight
        parts={[
          [
            { isHighlighted: true, value: 'te' },
            { isHighlighted: false, value: 'st' },
          ],
          [{ isHighlighted: false, value: 'nothing' }],
        ]}
        classNames={{ root: 'ROOT', highlighted: 'HIGHLIGHTED' }}
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
          <span>
            st
          </span>
          <span>
            ,
          </span>
          <span>
            nothing
          </span>
        </span>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <Highlight parts={[]} classNames={{ root: 'ROOT' }} aria-hidden="true" />
    );

    expect(container.querySelector('.ROOT')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });
});
