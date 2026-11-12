/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createClearRefinementsComponent } from '../ClearRefinements';

import type { ClearRefinementsProps } from '../ClearRefinements';

describe('ClearRefinements', () => {
  const ClearRefinements = createClearRefinementsComponent({
    createElement,
    Fragment,
  });

  function createProps(props: Partial<ClearRefinementsProps>) {
    return {
      canRefine: true,
      onClick: jest.fn(),
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});
    const { container } = render(<ClearRefinements {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button"
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('renders with a disabled button when there are no refinements', () => {
    const props = createProps({ canRefine: false });
    const { container } = render(<ClearRefinements {...props} />);

    const button = container.querySelector('button')!;
    expect(button.disabled).toBe(true);
    expect(button).toHaveClass(
      'ais-ClearRefinements-button',
      'ais-ClearRefinements-button--disabled'
    );
  });

  test('calls `onClick` when clicking the button', async () => {
    const props = createProps({});
    const { container } = render(<ClearRefinements {...props} />);

    await userEvent.click(container.querySelector('button')!);
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      canRefine: false,
      className: 'MyClearRefinements',
      classNames: {
        root: 'ROOT',
        button: 'BUTTON',
        disabledButton: 'DISABLED',
      },
    });
    const { container } = render(<ClearRefinements {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ClearRefinements ROOT MyClearRefinements"
        >
          <button
            class="ais-ClearRefinements-button BUTTON ais-ClearRefinements-button--disabled DISABLED"
            disabled=""
          >
            Clear refinements
          </button>
        </div>
      </div>
    `);
  });

  test('renders a custom reset label from `translations`', () => {
    const props = createProps({
      translations: { resetButtonText: 'Reset' },
    });
    const { container } = render(<ClearRefinements {...props} />);
    expect(container.querySelector('button')).toHaveTextContent('Reset');
  });

  test('renders a custom `resetLabelComponent`', () => {
    const props = createProps({
      resetLabelComponent: ({ canRefine }) => (
        <span>custom ({canRefine ? 'refinements' : 'nothing'})</span>
      ),
    });
    const { container } = render(<ClearRefinements {...props} />);
    expect(container.querySelector('button')).toMatchInlineSnapshot(`
      <button
        class="ais-ClearRefinements-button"
      >
        <span>
          custom (
          refinements
          )
        </span>
      </button>
    `);
  });
});
