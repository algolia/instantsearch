/** @jsx h */

import { h } from 'preact';
import { shallow } from 'enzyme';
import { fireEvent, render, waitForDomChange } from 'preact-testing-library';
import RangeInput from '../RangeInput';

describe('RangeInput', () => {
  const defaultProps = {
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

  const shallowRender = props =>
    shallow(<RangeInput {...defaultProps} {...props} />);

  it('expect to render', () => {
    const props = {};
    const component = shallowRender(props);

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
    it('expect to update the state when min change', async () => {
      const props = {};
      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput] = container.querySelectorAll('input[type="number"]');

      fireEvent.input(minInput, { target: { value: 20 } });

      await waitForDomChange({ container });

      expect(minInput.value).toEqual('20');
    });

    it('expect to update the state when max change', async () => {
      const props = {};
      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [, maxInput] = container.querySelectorAll('input[type="number"]');

      fireEvent.input(maxInput, { target: { value: 480 } });

      await waitForDomChange({ container });

      expect(maxInput.value).toEqual('480');
    });
  });

  describe('onSubmit', () => {
    it('expect to call refine with min, max as integer', async () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput, maxInput] = container.querySelectorAll(
        'input[type="number"]'
      );

      fireEvent.input(minInput, {
        target: { value: 20 },
      });
      fireEvent.input(maxInput, {
        target: { value: 480 },
      });

      await waitForDomChange({ container });

      fireEvent.submit(container.querySelector('form'));

      expect(props.refine).toHaveBeenCalledWith([20, 480]);
    });

    it('expect to call refine with min, max as float', async () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput, maxInput] = container.querySelectorAll(
        'input[type="number"]'
      );

      fireEvent.input(minInput, {
        target: { value: 20.05 },
      });
      fireEvent.input(maxInput, {
        target: { value: 480.05 },
      });

      await waitForDomChange({ container });

      fireEvent.submit(container.querySelector('form'));

      expect(props.refine).toHaveBeenCalledWith([20.05, 480.05]);
    });

    it('expect to call refine with min only', async () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [minInput] = container.querySelectorAll('input[type="number"]');

      fireEvent.input(minInput, {
        target: { value: 20 },
      });

      await waitForDomChange({ container });

      fireEvent.submit(container.querySelector('form'));

      expect(props.refine).toHaveBeenCalledWith([20, undefined]);
    });

    it('expect to call refine with max only', async () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      const [, maxInput] = container.querySelectorAll('input[type="number"]');

      fireEvent.input(maxInput, {
        target: { value: 480 },
      });

      await waitForDomChange({ container });

      fireEvent.submit(container.querySelector('form'));

      expect(props.refine).toHaveBeenCalledWith([undefined, 480]);
    });

    it('expect to call refine without values', () => {
      const props = {
        refine: jest.fn(),
      };

      const { container } = render(<RangeInput {...defaultProps} {...props} />);
      fireEvent.submit(container.querySelector('form'));

      expect(props.refine).toHaveBeenCalledWith([undefined, undefined]);
    });
  });
});
