import React from 'react';
import { mount } from 'enzyme';
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

    test('sets focus with autofocus to true', () => {
      const props = {
        ...defaultProps,
        autofocus: true,
      };
      mount(<SearchBox {...props} />);

      expect(document.activeElement.tagName).toBe('INPUT');
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
      test('refines input value on change', () => {
        const refine = jest.fn();
        const props = {
          ...defaultProps,
          searchAsYouType: true,
          refine,
        };
        const wrapper = mount(<SearchBox {...props} />);

        wrapper
          .find('input')
          .simulate('change', { target: { value: 'hello' } });

        expect(refine.mock.calls).toHaveLength(1);
        expect(refine.mock.calls[0][0]).toBe('hello');
      });
    });

    describe('searchAsYouType to false', () => {
      test('updates DOM input value on change', () => {
        const props = {
          ...defaultProps,
          query: 'Query 1',
          searchAsYouType: false,
        };
        const wrapper = mount(<SearchBox {...props} />);

        expect(wrapper.find('input').props().value).toBe('Query 1');

        wrapper
          .find('input')
          .simulate('change', { target: { value: 'Query 2' } });

        expect(wrapper.find('input').props().value).toBe('Query 2');
      });

      test('refines query on submit', () => {
        const refine = jest.fn();
        const props = {
          ...defaultProps,
          searchAsYouType: false,
          refine,
        };
        const wrapper = mount(<SearchBox {...props} />);

        wrapper
          .find('input')
          .simulate('change', { target: { value: 'hello' } });

        expect(refine.mock.calls).toHaveLength(0);

        wrapper.find('form').simulate('submit');

        expect(refine.mock.calls).toHaveLength(1);
        expect(refine.mock.calls[0][0]).toBe('hello');
      });
    });

    describe('onChange', () => {
      test('calls custom onChange', () => {
        const onChange = jest.fn();
        const props = {
          ...defaultProps,
          onChange,
        };
        const wrapper = mount(<SearchBox {...props} />);

        wrapper
          .find('input')
          .simulate('change', { target: { value: 'hello' } });

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
        const wrapper = mount(<SearchBox {...props} />);

        wrapper.find('form').simulate('submit');

        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });

    describe('onReset', () => {
      test('resets the input value with searchAsYouType to true', () => {
        const props = {
          ...defaultProps,
          searchAsYouType: true,
        };
        const wrapper = mount(<SearchBox {...props} />);

        wrapper
          .find('input')
          .simulate('change', { target: { value: 'hello' } });

        wrapper.find('form').simulate('reset');

        expect(wrapper.find('input').props().value).toBe('');
        expect(document.activeElement.tagName).toBe('INPUT');
      });

      test('resets the input value with searchAsYouType to false', () => {
        const props = {
          ...defaultProps,
          searchAsYouType: false,
        };
        const wrapper = mount(<SearchBox {...props} />);

        wrapper
          .find('input')
          .simulate('change', { target: { value: 'hello' } });
        wrapper.find('form').simulate('submit');

        expect(wrapper.find('input').props().value).not.toBe('');

        wrapper.find('form').simulate('reset');

        expect(wrapper.find('input').props().value).toBe('');
        expect(document.activeElement.tagName).toBe('INPUT');
      });

      test('calls custom onReset', () => {
        const onReset = jest.fn();
        const props = {
          ...defaultProps,
          onReset,
        };
        const wrapper = mount(<SearchBox {...props} />);

        wrapper.find('form').simulate('reset');

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
