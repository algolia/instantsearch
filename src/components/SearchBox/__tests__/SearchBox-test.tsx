/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import { ReactElementLike } from 'prop-types';
import { render, fireEvent } from '@testing-library/preact';
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
        const wrapper = mount(
          (<SearchBox {...defaultProps} />) as ReactElementLike
        );

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
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('input').props().value).toBe('Initial query');
      });
    });

    describe('placeholder', () => {
      test('sets placeholder', () => {
        const props = {
          ...defaultProps,
          placeholder: 'Custom placeholder',
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

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
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.submit').props().hidden).toBe(false);
      });

      test('hides the submit button when false', () => {
        const props = {
          ...defaultProps,
          showSubmit: false,
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.submit').props().hidden).toBe(true);
      });
    });

    describe('showReset', () => {
      test('hides the reset button by default without query', () => {
        const props = {
          ...defaultProps,
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.reset').props().hidden).toBe(true);
      });

      test('shows the reset button by default with query', () => {
        const props = {
          ...defaultProps,
          query: 'query',
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.reset').props().hidden).toBe(false);
      });

      test('hides the reset button when false', () => {
        const props = {
          ...defaultProps,
          showReset: false,
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.reset').props().hidden).toBe(true);
      });
    });

    describe('showLoadingIndicator', () => {
      test('removes loadingIndicator from DOM when false', () => {
        const props = {
          ...defaultProps,
          showLoadingIndicator: false,
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.exists('.loadingIndicator')).toBe(false);
      });

      test('hides loadingIndicator when true but search is not stalled', () => {
        const props = {
          ...defaultProps,
          showLoadingIndicator: true,
          isSearchStalled: false,
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.loadingIndicator').props().hidden).toBe(true);
      });

      test('shows loadingIndicator when true and search is stalled', () => {
        const props = {
          ...defaultProps,
          showLoadingIndicator: true,
          isSearchStalled: true,
        };
        const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

        expect(wrapper.find('.loadingIndicator').props().hidden).toBe(false);
      });
    });

    test('sets focus with autofocus to true', () => {
      const props = {
        ...defaultProps,
        autofocus: true,
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector('input');

      // @TODO Since the Preact X migration and new testing environment, this
      // assertion doesn't work. Once it does, we can remove the
      // `toHaveAttribute` assertion.
      // expect(input).toHaveFocus();
      expect(input).toHaveAttribute('autofocus', 'true');
    });

    test('disables the input with disabled to true', () => {
      const props = {
        ...defaultProps,
        disabled: true,
      };
      const wrapper = mount((<SearchBox {...props} />) as ReactElementLike);

      expect(wrapper.find('input').props().disabled).toBe(true);
    });
  });

  describe('Events', () => {
    describe('focus/blur', () => {
      test('does not derive value from prop when focused', () => {
        // This makes sure we don't override the user's input while they're typing.
        // This issue is more obvious when using queryHook to add debouncing.

        const props = {
          ...defaultProps,
          query: 'Initial query',
        };
        const { container, rerender } = render(<SearchBox {...props} />);
        const input = container.querySelector('input')!;
        expect(input.value).toEqual('Initial query');

        fireEvent.focus(input);
        rerender(<SearchBox {...props} query={'Query updated through prop'} />);

        expect(input.value).toEqual('Initial query');
      });

      test('derives value from prop when not focused', () => {
        const props = {
          ...defaultProps,
          query: 'Initial query',
        };
        const { container, rerender } = render(<SearchBox {...props} />);
        const input = container.querySelector('input')!;
        expect(input.value).toEqual('Initial query');

        fireEvent.blur(input);
        rerender(<SearchBox {...props} query={'Query updated through prop'} />);

        expect(input.value).toEqual('Query updated through prop');
      });
    });
    describe('searchAsYouType to true', () => {
      test('refines input value on input', () => {
        const refine = jest.fn();
        const props = {
          ...defaultProps,
          searchAsYouType: true,
          refine,
        };
        const { container } = render(<SearchBox {...props} />);
        const input = container.querySelector('input')!;

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
        const input = container.querySelector('input')!;

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
        const form = container.querySelector('form')!;
        const input = container.querySelector('input')!;

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
        const input = container.querySelector('input')!;

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
        const form = container.querySelector('form')!;

        fireEvent.submit(form);

        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });

    describe('onReset', () => {
      describe('with button click', () => {
        test('resets the input value with searchAsYouType to true', () => {
          const props = {
            ...defaultProps,
            searchAsYouType: true,
          };
          const { container } = render(<SearchBox {...props} />);
          const input = container.querySelector('input')!;
          const resetButton = container.querySelector('button[type="reset"]')!;

          fireEvent.change(input, {
            target: { value: 'hello' },
          });

          expect(input.value).toEqual('hello');

          fireEvent.click(resetButton);

          expect(input.value).toEqual('');
          expect(input).toHaveFocus();
        });

        test('resets the input value with searchAsYouType to false', () => {
          const props = {
            ...defaultProps,
            searchAsYouType: false,
          };
          const { container } = render(<SearchBox {...props} />);
          const form = container.querySelector('form')!;
          const input = container.querySelector('input')!;
          const resetButton = container.querySelector('button[type="reset"]')!;

          fireEvent.input(input, { target: { value: 'hello' } });
          fireEvent.submit(form);

          expect(input.value).toEqual('hello');

          fireEvent.click(resetButton);

          expect(input.value).toEqual('');
          expect(input).toHaveFocus();
        });

        test('calls custom onReset', () => {
          const onReset = jest.fn();
          const props = {
            ...defaultProps,
            onReset,
          };
          const { container } = render(<SearchBox {...props} />);
          const resetButton = container.querySelector('button[type="reset"]')!;

          fireEvent.click(resetButton);

          expect(onReset).toHaveBeenCalledTimes(1);
        });
      });

      describe('when form is reset programmatically', () => {
        test('resets the input value with searchAsYouType to true', () => {
          const props = {
            ...defaultProps,
            searchAsYouType: true,
          };
          const { container } = render(<SearchBox {...props} />);
          const input = container.querySelector('input')!;
          const form = container.querySelector('form')!;

          fireEvent.change(input, {
            target: { value: 'hello' },
          });

          expect(input.value).toEqual('hello');

          fireEvent.reset(form);

          expect(input.value).toEqual('');
          expect(input).toHaveFocus();
        });

        test('resets the input value with searchAsYouType to false', () => {
          const props = {
            ...defaultProps,
            searchAsYouType: false,
          };
          const { container } = render(<SearchBox {...props} />);
          const form = container.querySelector('form')!;
          const input = container.querySelector('input')!;

          fireEvent.input(input, { target: { value: 'hello' } });
          fireEvent.submit(form);

          expect(input.value).toEqual('hello');

          fireEvent.reset(form);

          expect(input.value).toEqual('');
          expect(input).toHaveFocus();
        });

        test('calls custom onReset', () => {
          const onReset = jest.fn();
          const props = {
            ...defaultProps,
            onReset,
          };
          const { container } = render(<SearchBox {...props} />);
          const form = container.querySelector('form')!;

          fireEvent.reset(form);

          expect(onReset).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('Rendering', () => {
    test('with default props', () => {
      expect(
        mount((<SearchBox {...defaultProps} />) as ReactElementLike)
      ).toMatchSnapshot();
    });

    test('sets search input attributes', () => {
      const res = render(
        <SearchBox {...defaultProps} autofocus={true} query="sample query" />
      );
      const input = res.getByDisplayValue('sample query');

      expect(input).toHaveAttribute('autofocus', 'true');
      expect(input).toHaveAttribute('autocomplete', 'off');
      expect(input).toHaveAttribute('autocorrect', 'off');
      expect(input).toHaveAttribute('autocapitalize', 'off');
      expect(input).toHaveAttribute('spellcheck', 'false');
      expect(input).toHaveAttribute('maxlength', '512');
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

      expect(
        mount((<SearchBox {...props} />) as ReactElementLike)
      ).toMatchSnapshot();
    });
  });
});
