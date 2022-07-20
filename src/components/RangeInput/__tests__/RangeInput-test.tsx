/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { shallow } from '../../../../test/utils/enzyme';
import { render, fireEvent } from '@testing-library/preact';
import type { RangeInputProps } from '../RangeInput';
import RangeInput from '../RangeInput';

describe('RangeInput', () => {
  const defaultProps: RangeInputProps = {
    min: 0,
    max: 500,
    step: 1,
    values: {},
    cssClasses: {
      root: 'root',
      noRefinement: 'noRefinement',
      form: 'form',
      label: 'label',
      input: 'input',
      inputMin: 'inputMin',
      inputMax: 'inputMax',
      separator: 'separator',
      submit: 'submit',
    },
    templateProps: {
      templates: {
        separatorText: 'to',
        submitText: 'Go',
      },
    },
    refine: () => {},
  };

  const shallowRender = (props?: Partial<RangeInputProps>) =>
    shallow(<RangeInput {...defaultProps} {...props} />);

  it('expect to render', () => {
    const component = shallowRender();

    expect(component).toMatchSnapshot();
  });

  it('expect to render with values', () => {
    const props = {
      values: {
        min: 20,
        max: 480,
      },
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
    expect(component.state()).toEqual({
      min: 20,
      max: 480,
    });
  });

  it('expect to render with disabled state', () => {
    const props = {
      min: 480,
      max: 20,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('renders component with custom `html` templates', () => {
    const { container } = render(
      <RangeInput
        {...defaultProps}
        values={{ min: 20, max: 480 }}
        templateProps={{
          templates: {
            separatorText(_, { html }) {
              return html`<span>to</span>`;
            },
            submitText(_, { html }) {
              return html`<span>Go</span>`;
            },
          },
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <form
      class="form"
    >
      <label
        class="label"
      >
        <input
          class="input inputMin"
          max="500"
          min="0"
          placeholder="0"
          step="1"
          type="number"
        />
      </label>
      <span
        class="separator"
      >
        <span>
          to
        </span>
      </span>
      <label
        class="label"
      >
        <input
          class="input inputMax"
          max="500"
          min="0"
          placeholder="500"
          step="1"
          type="number"
        />
      </label>
      <button
        class="submit"
        type="submit"
      >
        <span>
          Go
        </span>
      </button>
    </form>
  </div>
</div>
`);
  });

  describe('willReceiveProps', () => {
    it('expect to update the empty state from given props', () => {
      const props = {};
      const nextProps = {
        values: {
          min: 20,
          max: 480,
        },
      };

      const component = shallowRender(props);

      expect(component).toMatchSnapshot();

      component.setProps(nextProps);

      expect(component).toMatchSnapshot();
      expect(component.state()).toEqual({
        min: 20,
        max: 480,
      });
    });

    it('expect to update the state from given props', () => {
      const props = {
        values: {
          min: 40,
          max: 460,
        },
      };

      const nextProps = {
        values: {
          min: 20,
          max: 480,
        },
      };

      const component = shallowRender(props);

      expect(component).toMatchSnapshot();

      component.setProps(nextProps);

      expect(component).toMatchSnapshot();
      expect(component.state()).toEqual({
        min: 20,
        max: 480,
      });
    });
  });

  describe('onChange', () => {
    it('expect to update the state when min change', () => {
      const props = {};
      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput] = container.querySelectorAll<HTMLInputElement>(
        'input[type="number"]'
      );

      fireEvent.input(minInput, { target: { value: 20 } });

      expect(minInput.value).toEqual('20');
    });

    it('expect to update the state when max change', () => {
      const props = {};
      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [, maxInput] = container.querySelectorAll<HTMLInputElement>(
        'input[type="number"]'
      );

      fireEvent.input(maxInput, { target: { value: 480 } });

      expect(maxInput.value).toEqual('480');
    });
  });

  describe('onSubmit', () => {
    it('expect to call refine with min, max as integer', () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput, maxInput] = container.querySelectorAll<HTMLInputElement>(
        'input[type="number"]'
      );

      fireEvent.input(minInput, {
        target: { value: 20 },
      });
      fireEvent.input(maxInput, {
        target: { value: 480 },
      });

      const form = container.querySelector('form');

      if (form) {
        fireEvent.submit(form);
      }

      expect(props.refine).toHaveBeenCalledWith([20, 480]);
    });

    it('expect to call refine with min, max as float', () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput, maxInput] = container.querySelectorAll<HTMLInputElement>(
        'input[type="number"]'
      );

      fireEvent.input(minInput, {
        target: { value: 20.05 },
      });
      fireEvent.input(maxInput, {
        target: { value: 480.05 },
      });

      const form = container.querySelector('form');

      if (form) {
        fireEvent.submit(form);
      }

      expect(props.refine).toHaveBeenCalledWith([20.05, 480.05]);
    });

    it('expect to call refine with min only', () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput] = container.querySelectorAll<HTMLInputElement>(
        'input[type="number"]'
      );

      fireEvent.input(minInput, {
        target: { value: 20 },
      });

      const form = container.querySelector('form');

      if (form) {
        fireEvent.submit(form);
      }

      expect(props.refine).toHaveBeenCalledWith([20, undefined]);
    });

    it('expect to call refine with max only', () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [, maxInput] = container.querySelectorAll<HTMLInputElement>(
        'input[type="number"]'
      );

      fireEvent.input(maxInput, {
        target: { value: 480 },
      });

      const form = container.querySelector('form');

      if (form) {
        fireEvent.submit(form);
      }

      expect(props.refine).toHaveBeenCalledWith([undefined, 480]);
    });

    it('expect to call refine without values', () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const form = container.querySelector('form');

      if (form) {
        fireEvent.submit(form);
      }

      expect(props.refine).toHaveBeenCalledWith([undefined, undefined]);
    });
  });
});
