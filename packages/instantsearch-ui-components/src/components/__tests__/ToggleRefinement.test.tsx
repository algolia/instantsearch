/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createToggleRefinementComponent } from '../ToggleRefinement';

import type { ToggleRefinementProps } from '../ToggleRefinement';

describe('ToggleRefinement', () => {
  const ToggleRefinement = createToggleRefinementComponent({
    createElement,
    Fragment,
  });

  function createProps(props: Partial<ToggleRefinementProps>) {
    return {
      checked: false,
      onChange: jest.fn(),
      label: 'Free shipping',
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});
    const { container } = render(<ToggleRefinement {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ToggleRefinement"
        >
          <label
            class="ais-ToggleRefinement-label"
          >
            <input
              class="ais-ToggleRefinement-checkbox"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText"
            >
              Free shipping
            </span>
          </label>
        </div>
      </div>
    `);
  });

  test('renders a checked checkbox', () => {
    const props = createProps({ checked: true });
    const { container } = render(<ToggleRefinement {...props} />);
    expect((container.querySelector('input') as HTMLInputElement).checked).toBe(
      true
    );
  });

  test('calls `onChange` with the next checked state', async () => {
    const props = createProps({ checked: false });
    const { container } = render(<ToggleRefinement {...props} />);

    await userEvent.click(container.querySelector('input')!);
    expect(props.onChange).toHaveBeenCalledWith(true);
  });

  test('renders a count when provided', () => {
    const props = createProps({ count: 543 });
    const { container } = render(<ToggleRefinement {...props} />);
    expect(container.querySelector('.ais-ToggleRefinement-count'))
      .toMatchInlineSnapshot(`
      <span
        class="ais-ToggleRefinement-count"
      >
        543
      </span>
    `);
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyToggle',
      classNames: {
        root: 'ROOT',
        label: 'LABEL',
        checkbox: 'CHECKBOX',
        labelText: 'LABELTEXT',
        count: 'COUNT',
      },
    });
    const { container } = render(<ToggleRefinement {...props} count={4} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-ToggleRefinement ROOT MyToggle"
        >
          <label
            class="ais-ToggleRefinement-label LABEL"
          >
            <input
              class="ais-ToggleRefinement-checkbox CHECKBOX"
              type="checkbox"
            />
            <span
              class="ais-ToggleRefinement-labelText LABELTEXT"
            >
              Free shipping
            </span>
            <span
              class="ais-ToggleRefinement-count COUNT"
            >
              4
            </span>
          </label>
        </div>
      </div>
    `);
  });

  test('renders a custom `labelTextComponent`', () => {
    const props = createProps({
      value: { name: 'free_shipping', isRefined: false, count: null },
      labelTextComponent: ({ value }) => <em>{value.name}</em>,
    });
    const { container } = render(<ToggleRefinement {...props} />);
    expect(container.querySelector('.ais-ToggleRefinement-labelText'))
      .toMatchInlineSnapshot(`
        <span
          class="ais-ToggleRefinement-labelText"
        >
          <em>
            free_shipping
          </em>
        </span>
      `);
  });

  test('omits the label text element when `labelTextComponent` returns `null`', () => {
    // The JS flavor's `templates.labelText` owned the
    // `ais-ToggleRefinement-labelText` span and removed it from the DOM when
    // the template resolved to `null`.
    const props = createProps({
      value: { name: 'free_shipping', isRefined: false, count: null },
      labelTextComponent: () => null,
    });
    const { container } = render(<ToggleRefinement {...props} />);
    expect(
      container.querySelector('.ais-ToggleRefinement-labelText')
    ).toBeNull();
    expect(container.querySelector('input')).not.toBeNull();
  });

  test('does not spread the `value` prop on the root element', () => {
    const props = createProps({
      value: { name: 'free_shipping', isRefined: false, count: null },
    });
    const { container } = render(<ToggleRefinement {...props} />);
    expect(
      container.querySelector('.ais-ToggleRefinement')!.outerHTML
    ).not.toContain('free_shipping');
  });

  test('fires change on click', () => {
    const props = createProps({});
    const { container } = render(<ToggleRefinement {...props} />);
    fireEvent.click(container.querySelector('input')!);
    expect(props.onChange).toHaveBeenCalled();
  });
});
