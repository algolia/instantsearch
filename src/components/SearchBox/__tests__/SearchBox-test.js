/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import { render, fireEvent } from 'preact-testing-library';
import SearchBox from '../SearchBox';

const defaultProps = {
  placeholder: '',
  cssClasses: {
    root: 'root',
    form: 'form',
    input: 'input',
    submit: 'submit',
    submitIcon: 'submitIcon',
    reset: 'reset',
    resetIcon: 'resetIcon',
    loadingIndicator: 'loadingIndicator',
    loadingIcon: 'loadingIcon',
  },
  templates: {
    reset: 'reset',
    submit: 'submit',
    loadingIndicator: 'loadingIndicator',
  },
};

describe('SearchBox', () => {
  describe('Props', () => {
    describe('cssClasses', () => {
      test('sets all CSS classes', () => {
        const wrapper = mount(<SearchBox {...defaultProps} />);

        expect(wrapper.find('div').hasClass('root')).toEqual(true);
        expect(wrapper.find('form').hasClass('form')).toEqual(true);
        expect(wrapper.find('input').hasClass('input')).toEqual(true);
        expect(
          wrapper.find('button[type="submit"]').hasClass('submit')
        ).toEqual(true);
        expect(wrapper.find('button[type="reset"]').hasClass('reset')).toEqual(
          true
        );
        expect(wrapper.find('span').hasClass('loadingIndicator')).toEqual(true);
      });
    });

    describe('query', () => {
      test('sets query', () => {
        const props = {
          ...defaultProps,
          query: 'Initial query',
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('input').props().value).toBe('Initial query');
      });
    });

    describe('placeholder', () => {
      test('sets placeholder', () => {
        const props = {
          ...defaultProps,
          placeholder: 'Custom placeholder',
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('input').props().placeholder).toBe(
          'Custom placeholder'
        );
      });
    });

    describe('showSubmit', () => {
      test('show the submit button by default', () => {
        const props = {
          ...defaultProps,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.submit').props().hidden).toBe(false);
      });

      test('hides the submit button when false', () => {
        const props = {
          ...defaultProps,
          showSubmit: false,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.submit').props().hidden).toBe(true);
      });
    });

    describe('showReset', () => {
      test('hides the reset button by default without query', () => {
        const props = {
          ...defaultProps,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.reset').props().hidden).toBe(true);
      });

      test('shows the reset button by default with query', () => {
        const props = {
          ...defaultProps,
          query: 'query',
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.reset').props().hidden).toBe(false);
      });

      test('hides the reset button when false', () => {
        const props = {
          ...defaultProps,
          showReset: false,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.reset').props().hidden).toBe(true);
      });
    });

    describe('showLoadingIndicator', () => {
      test('removes loadingIndicator from DOM when false', () => {
        const props = {
          ...defaultProps,
          showLoadingIndicator: false,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.exists('.loadingIndicator')).toBe(false);
      });

      test('hides loadingIndicator when true but search is not stalled', () => {
        const props = {
          ...defaultProps,
          showLoadingIndicator: true,
          isSearchStalled: false,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.loadingIndicator').props().hidden).toBe(true);
      });

      test('shows loadingIndicator when true and search is stalled', () => {
        const props = {
          ...defaultProps,
          showLoadingIndicator: true,
          isSearchStalled: true,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('.loadingIndicator').props().hidden).toBe(false);
      });
    });

    // @TODO Since the Preact X migration and new testing environment, this test
    // doesn't pass.
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('sets focus with autofocus to true', () => {
      const props = {
        ...defaultProps,
        autofocus: true,
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector('input');

      expect(document.activeElement).toBe(input);
    });

    test('disables the input with disabled to true', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const wrapper = mount(<SearchBox {...props} />);

      expect(wrapper.find('input').props().disabled).toBe(true);
    });
  });

  describe('Events', () => {
    describe('searchAsYouType to true', () => {
      test('refines input value on input', () => {
        const refine = jest.fn();
        const props = {
          ...defaultProps,
          searchAsYouType: true,
          refine,
        };
        const { container } = render(<SearchBox {...props} />);
        const input = container.querySelector('input');

        fireEvent.input(input, {
          target: { value: 'hello' },
        });

        expect(refine).toHaveBeenCalledTimes(1);
        expect(refine).toHaveBeenLastCalledWith('hello');
      });
    });

    describe('searchAsYouType to false', () => {
      test('updates DOM input value on input', () => {
        const props = {
          ...defaultProps,
          query: 'Query 1',
          searchAsYouType: false,
        };
        const { container } = render(<SearchBox {...props} />);
        const input = container.querySelector('input');

        expect(input.value).toEqual('Query 1');

        fireEvent.input(input, {
          target: { value: 'Query 2' },
        });

        expect(input.value).toEqual('Query 2');
      });

      test('refines query on submit', () => {
        const refine = jest.fn();
        const props = {
          ...defaultProps,
          searchAsYouType: false,
          refine,
        };
        const { container } = render(<SearchBox {...props} />);
        const form = container.querySelector('form');
        const input = container.querySelector('input');

        fireEvent.input(input, {
          target: { value: 'hello' },
        });

        expect(refine).toHaveBeenCalledTimes(0);

        fireEvent.submit(form);

        expect(refine).toHaveBeenCalledTimes(1);
        expect(refine).toHaveBeenLastCalledWith('hello');
      });
    });

    describe('onChange', () => {
      test('calls custom onChange', () => {
        const onChange = jest.fn();
        const props = {
          ...defaultProps,
          onChange,
        };
        const { container } = render(<SearchBox {...props} />);
        const input = container.querySelector('input');

        fireEvent.input(input, {
          target: { value: 'hello' },
        });

        expect(onChange).toHaveBeenCalledTimes(1);
      });
    });

    describe('onSubmit', () => {
      test('calls custom onSubmit', () => {
        const onSubmit = jest.fn();
        const props = {
          ...defaultProps,
          onSubmit,
        };
        const { container } = render(<SearchBox {...props} />);
        const form = container.querySelector('form');

        fireEvent.submit(form);

        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });

    // @TODO Since the Preact X migration and new testing environment, this test
    // suite doesn't pass.
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip('onReset', () => {
      test('resets the input value with searchAsYouType to true', () => {
        const props = {
          ...defaultProps,
          searchAsYouType: true,
        };
        const { container } = render(<SearchBox {...props} />);
        const input = container.querySelector('input');
        const resetButton = container.querySelector('button[type="reset"]');

        fireEvent.change(input, {
          target: { value: 'hello' },
        });

        fireEvent.click(resetButton);

        expect(input.value).toEqual('');
        expect(document.activeElement).toBe(input);
      });

      test('resets the input value with searchAsYouType to false', () => {
        const props = {
          ...defaultProps,
          searchAsYouType: false,
        };
        const { container } = render(<SearchBox {...props} />);
        const form = container.querySelector('form');
        const input = container.querySelector('input');
        const resetButton = container.querySelector('button[type="reset"]');

        fireEvent.input(input, { target: { value: 'hello' } });
        fireEvent.submit(form);

        expect(input.value).toEqual('hello');

        fireEvent.click(resetButton);

        expect(input.value).toEqual('');
        expect(document.activeElement).toBe(input);
      });

      test('calls custom onReset', () => {
        const onReset = jest.fn();
        const props = {
          ...defaultProps,
          onReset,
        };
        const { container } = render(<SearchBox {...props} />);
        const resetButton = container.querySelector('button[type="reset"]');

        fireEvent.click(resetButton);

        expect(onReset).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Rendering', () => {
    test('with default props', () => {
      expect(mount(<SearchBox {...defaultProps} />)).toMatchSnapshot();
    });

    test('with custom templates', () => {
      const props = {
        ...defaultProps,
        templates: {
          reset: 'reset template',
          submit: 'submit template',
          loadingIndicator: 'loadingIndicator template',
        },
      };

      expect(mount(<SearchBox {...props} />)).toMatchSnapshot();
    });
  });
});
