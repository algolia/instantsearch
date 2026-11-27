/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createStatsComponent } from '../Stats';

describe('Stats', () => {
  const Stats = createStatsComponent({ createElement, Fragment });

  test('renders with default props', () => {
    const { container } = render(<Stats text="1,234 results found in 42ms" />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Stats"
        >
          <span
            class="ais-Stats-text"
          >
            1,234 results found in 42ms
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            class="ais-Stats-announcement"
            role="status"
            style="position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;"
          />
        </div>
      </div>
    `);
  });

  test('renders the announcement', () => {
    const { container } = render(
      <Stats text="5 results found in 1ms" announcement="5 results" />
    );

    expect(
      container.querySelector('.ais-Stats-announcement')
    ).toHaveTextContent('5 results');
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <Stats
        className="MyCustomStats"
        classNames={{
          root: 'ROOT',
          text: 'TEXT',
          announcement: 'ANNOUNCEMENT',
        }}
        text="text"
      />
    );

    expect(container.querySelector('.ais-Stats')).toHaveClass(
      'ROOT',
      'MyCustomStats'
    );
    expect(container.querySelector('.ais-Stats-text')).toHaveClass('TEXT');
    expect(container.querySelector('.ais-Stats-announcement')).toHaveClass(
      'ANNOUNCEMENT'
    );
  });

  test('forwards root props', () => {
    const { container } = render(
      <Stats text="text" title="Some custom title" />
    );

    expect(container.querySelector('.ais-Stats')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });

  test('renders an element as text', () => {
    const { container } = render(<Stats text={<strong>custom</strong>} />);

    expect(container.querySelector('.ais-Stats-text')!.innerHTML).toBe(
      '<strong>custom</strong>'
    );
  });

  test('omits the text element when the text is `null`', () => {
    const { container } = render(<Stats text={null} announcement="" />);

    expect(container.querySelector('.ais-Stats-text')).toBeNull();
    expect(
      container.querySelector('.ais-Stats-announcement')
    ).toBeInTheDocument();
  });

  test('replaces the text element with `textComponent`', () => {
    const { container } = render(
      <Stats
        text="ignored"
        textComponent={() => <p className="custom">custom</p>}
      />
    );

    expect(container.querySelector('.ais-Stats-text')).toBeNull();
    expect(container.querySelector('.ais-Stats > .custom')).toHaveTextContent(
      'custom'
    );
    expect(
      container.querySelector('.ais-Stats-announcement')
    ).toBeInTheDocument();
  });
});
