/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createRangeInputComponent } from '../RangeInput';

import type { RangeInputProps } from '../RangeInput';

describe('RangeInput', () => {
  const RangeInput = createRangeInputComponent({
    createElement,
    Fragment,
  });

  function createProps(props: Partial<RangeInputProps> = {}) {
    return {
      min: 0,
      max: 500,
      onFromChange: jest.fn(),
      onToChange: jest.fn(),
      onSubmit: jest.fn(),
      ...props,
    };
  }

  function getInputs(container: Element) {
    return Array.from(
      container.querySelectorAll<HTMLInputElement>('.ais-RangeInput-input')
    );
  }

  test('renders with default props', () => {
    const { container } = render(<RangeInput {...createProps()} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-RangeInput"
        >
          <form
            class="ais-RangeInput-form"
          >
            <label
              class="ais-RangeInput-label"
            >
              <input
                class="ais-RangeInput-input ais-RangeInput-input--min"
                max="500"
                min="0"
                placeholder="0"
                step="1"
                type="number"
              />
            </label>
            <span
              class="ais-RangeInput-separator"
            >
              to
            </span>
            <label
              class="ais-RangeInput-label"
            >
              <input
                class="ais-RangeInput-input ais-RangeInput-input--max"
                max="500"
                min="0"
                placeholder="500"
                step="1"
                type="number"
              />
            </label>
            <button
              class="ais-RangeInput-submit"
              type="submit"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    `);
  });

  test('renders the values', () => {
    const { container } = render(
      <RangeInput {...createProps({ fromValue: '20', toValue: '480' })} />
    );

    expect(getInputs(container).map((input) => input.value)).toEqual([
      '20',
      '480',
    ]);
  });

  test('strips leading zeros from the values', () => {
    const { container } = render(
      <RangeInput {...createProps({ fromValue: '0020', toValue: '00.5' })} />
    );

    expect(getInputs(container).map((input) => input.value)).toEqual([
      '20',
      '0.5',
    ]);
  });

  test('renders the step', () => {
    const { container } = render(
      <RangeInput {...createProps({ step: 0.01 })} />
    );

    getInputs(container).forEach((input) => {
      expect(input).toHaveAttribute('step', '0.01');
    });
  });

  test('adds the noRefinement modifier and disables the form when it cannot refine', () => {
    const { container } = render(
      <RangeInput {...createProps({ canRefine: false })} />
    );

    expect(container.querySelector('.ais-RangeInput')).toHaveClass(
      'ais-RangeInput--noRefinement'
    );
    getInputs(container).forEach((input) => {
      expect(input).toBeDisabled();
    });
    expect(container.querySelector('.ais-RangeInput-submit')).toBeDisabled();
  });

  test('does not add the noRefinement modifier when it can refine', () => {
    const { container } = render(
      <RangeInput {...createProps({ canRefine: true })} />
    );

    expect(container.querySelector('.ais-RangeInput')).not.toHaveClass(
      'ais-RangeInput--noRefinement'
    );
    getInputs(container).forEach((input) => {
      expect(input).not.toBeDisabled();
    });
    expect(
      container.querySelector('.ais-RangeInput-submit')
    ).not.toBeDisabled();
  });

  test('calls the change callbacks with the raw input values', () => {
    const props = createProps();
    const { container } = render(<RangeInput {...props} />);
    const [minInput, maxInput] = getInputs(container);

    fireEvent.input(minInput, { target: { value: '20.05' } });
    fireEvent.input(maxInput, { target: { value: '480' } });

    expect(props.onFromChange).toHaveBeenCalledTimes(1);
    expect(props.onFromChange).toHaveBeenLastCalledWith('20.05');
    expect(props.onToChange).toHaveBeenCalledTimes(1);
    expect(props.onToChange).toHaveBeenLastCalledWith('480');
  });

  test('calls `onSubmit` and prevents the default form submission', () => {
    const props = createProps();
    const { container } = render(<RangeInput {...props} />);

    const event = new Event('submit', { bubbles: true, cancelable: true });
    container.querySelector('form')!.dispatchEvent(event);

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  test('renders translations', () => {
    const { container } = render(
      <RangeInput
        {...createProps({
          translations: {
            separatorElementText: 'SEPARATOR',
            submitButtonText: 'SUBMIT',
          },
        })}
      />
    );

    expect(
      container.querySelector('.ais-RangeInput-separator')
    ).toHaveTextContent('SEPARATOR');
    expect(container.querySelector('.ais-RangeInput-submit')).toHaveTextContent(
      'SUBMIT'
    );
  });

  test('renders component overrides', () => {
    const { container } = render(
      <RangeInput
        {...createProps({
          separatorTextComponent: () => <em>SEPARATOR</em>,
          submitTextComponent: () => <em>SUBMIT</em>,
          minLabelComponent: () => <span>Min</span>,
          maxLabelComponent: () => <span>Max</span>,
        })}
      />
    );

    expect(
      container.querySelector('.ais-RangeInput-separator')!.innerHTML
    ).toBe('<em>SEPARATOR</em>');
    expect(container.querySelector('.ais-RangeInput-submit')!.innerHTML).toBe(
      '<em>SUBMIT</em>'
    );
    expect(
      Array.from(container.querySelectorAll('.ais-RangeInput-label')).map(
        (label) => label.firstElementChild!.outerHTML
      )
    ).toEqual(['<span>Min</span>', '<span>Max</span>']);
  });

  test('omits the separator and submit when their components return `null`', () => {
    const { container } = render(
      <RangeInput
        {...createProps({
          separatorTextComponent: () => null,
          submitTextComponent: () => null,
        })}
      />
    );

    expect(container.querySelector('.ais-RangeInput-separator')).toBeNull();
    expect(container.querySelector('.ais-RangeInput-submit')).toBeNull();
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <RangeInput
        {...createProps({
          canRefine: false,
          className: 'MyCustomRangeInput',
          classNames: {
            root: 'ROOT',
            noRefinementRoot: 'NOREFINEMENTROOT',
            form: 'FORM',
            label: 'LABEL',
            input: 'INPUT',
            inputMin: 'INPUTMIN',
            inputMax: 'INPUTMAX',
            separator: 'SEPARATOR',
            submit: 'SUBMIT',
          },
        })}
      />
    );

    expect(container.querySelector('.ais-RangeInput')!.className).toBe(
      'ais-RangeInput ROOT ais-RangeInput--noRefinement NOREFINEMENTROOT MyCustomRangeInput'
    );
    expect(container.querySelector('.ais-RangeInput-form')).toHaveClass('FORM');
    container.querySelectorAll('.ais-RangeInput-label').forEach((label) => {
      expect(label).toHaveClass('LABEL');
    });
    expect(
      container.querySelector('.ais-RangeInput-input--min')!.className
    ).toBe('ais-RangeInput-input INPUT ais-RangeInput-input--min INPUTMIN');
    expect(
      container.querySelector('.ais-RangeInput-input--max')!.className
    ).toBe('ais-RangeInput-input INPUT ais-RangeInput-input--max INPUTMAX');
    expect(container.querySelector('.ais-RangeInput-separator')).toHaveClass(
      'SEPARATOR'
    );
    expect(container.querySelector('.ais-RangeInput-submit')).toHaveClass(
      'SUBMIT'
    );
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <RangeInput {...createProps({ title: 'Some custom title' })} />
    );

    expect(container.querySelector('.ais-RangeInput')).toHaveAttribute(
      'title',
      'Some custom title'
    );
  });
});
