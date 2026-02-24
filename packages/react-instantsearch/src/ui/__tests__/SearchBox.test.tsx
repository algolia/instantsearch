/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';

import { SearchBox } from '../SearchBox';

import type { SearchBoxProps } from '../SearchBox';

describe('SearchBox', () => {
  function createProps(props: Partial<SearchBoxProps>) {
    const onChange = jest.fn();
    const onReset = jest.fn();
    const onSubmit = jest.fn();

    return {
      formRef: createRef<HTMLFormElement>(),
      inputRef: createRef<HTMLInputElement>(),
      isSearchStalled: false,
      onChange,
      onReset,
      onSubmit,
      placeholder: '',
      value: '',
      autoFocus: false,
      translations: {
        submitButtonTitle: 'Submit the search query.',
        resetButtonTitle: 'Clear the search query.',
      },
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});

    const { container } = render(<SearchBox {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SearchBox"
        >
          <form
            action=""
            class="ais-SearchBox-form"
            novalidate=""
            role="search"
          >
            <input
              aria-label="Search"
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              class="ais-SearchBox-input"
              maxlength="512"
              placeholder=""
              spellcheck="false"
              type="search"
              value=""
            />
            <button
              class="ais-SearchBox-submit"
              title="Submit the search query."
              type="submit"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-submitIcon"
                height="10"
                viewBox="0 0 40 40"
                width="10"
              >
                <path
                  d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
                />
              </svg>
            </button>
            <button
              class="ais-SearchBox-reset"
              hidden=""
              title="Clear the search query."
              type="reset"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-resetIcon"
                height="10"
                viewBox="0 0 20 20"
                width="10"
              >
                <path
                  d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
                />
              </svg>
            </button>
            <span
              class="ais-SearchBox-loadingIndicator"
              hidden=""
            >
              <svg
                aria-hidden="true"
                aria-label="Results are loading"
                class="ais-SearchBox-loadingIcon"
                height="16"
                stroke="#444"
                viewBox="0 0 38 38"
                width="16"
              >
                <g
                  fill="none"
                  fill-rule="evenodd"
                >
                  <g
                    stroke-width="2"
                    transform="translate(1 1)"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="18"
                      stroke-opacity=".5"
                    />
                    <path
                      d="M36 18c0-9.94-8.06-18-18-18"
                    >
                      <animatetransform
                        attributeName="transform"
                        dur="1s"
                        from="0 18 18"
                        repeatCount="indefinite"
                        to="360 18 18"
                        type="rotate"
                      />
                    </path>
                  </g>
                </g>
              </svg>
            </span>
          </form>
        </div>
      </div>
    `);

    expect(within(container).getByRole('searchbox')).not.toHaveFocus();
  });

  test('renders with translations', () => {
    const props = createProps({
      translations: {
        submitButtonTitle: 'Submit search',
        resetButtonTitle: 'Reset query',
      },
    });
    const { container } = render(<SearchBox {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SearchBox"
        >
          <form
            action=""
            class="ais-SearchBox-form"
            novalidate=""
            role="search"
          >
            <input
              aria-label="Search"
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              class="ais-SearchBox-input"
              maxlength="512"
              placeholder=""
              spellcheck="false"
              type="search"
              value=""
            />
            <button
              class="ais-SearchBox-submit"
              title="Submit search"
              type="submit"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-submitIcon"
                height="10"
                viewBox="0 0 40 40"
                width="10"
              >
                <path
                  d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
                />
              </svg>
            </button>
            <button
              class="ais-SearchBox-reset"
              hidden=""
              title="Reset query"
              type="reset"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-resetIcon"
                height="10"
                viewBox="0 0 20 20"
                width="10"
              >
                <path
                  d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
                />
              </svg>
            </button>
            <span
              class="ais-SearchBox-loadingIndicator"
              hidden=""
            >
              <svg
                aria-hidden="true"
                aria-label="Results are loading"
                class="ais-SearchBox-loadingIcon"
                height="16"
                stroke="#444"
                viewBox="0 0 38 38"
                width="16"
              >
                <g
                  fill="none"
                  fill-rule="evenodd"
                >
                  <g
                    stroke-width="2"
                    transform="translate(1 1)"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="18"
                      stroke-opacity=".5"
                    />
                    <path
                      d="M36 18c0-9.94-8.06-18-18-18"
                    >
                      <animatetransform
                        attributeName="transform"
                        dur="1s"
                        from="0 18 18"
                        repeatCount="indefinite"
                        to="360 18 18"
                        type="rotate"
                      />
                    </path>
                  </g>
                </g>
              </svg>
            </span>
          </form>
        </div>
      </div>
    `);
  });

  test('renders with component slots', () => {
    const props = createProps({
      resetIconComponent: () => <>reset</>,
      submitIconComponent: () => <>submit</>,
      loadingIconComponent: () => <>loading</>,
    });

    const { container } = render(<SearchBox {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SearchBox"
        >
          <form
            action=""
            class="ais-SearchBox-form"
            novalidate=""
            role="search"
          >
            <input
              aria-label="Search"
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              class="ais-SearchBox-input"
              maxlength="512"
              placeholder=""
              spellcheck="false"
              type="search"
              value=""
            />
            <button
              class="ais-SearchBox-submit"
              title="Submit the search query."
              type="submit"
            >
              submit
            </button>
            <button
              class="ais-SearchBox-reset"
              hidden=""
              title="Clear the search query."
              type="reset"
            >
              reset
            </button>
            <span
              class="ais-SearchBox-loadingIndicator"
              hidden=""
            >
              loading
            </span>
          </form>
        </div>
      </div>
    `);
  });

  test('forwards the value to the input', () => {
    const props = createProps({ value: 'query' });

    const { container } = render(<SearchBox {...props} />);

    expect(container.querySelector('.ais-SearchBox-input')).toHaveValue(
      'query'
    );
  });

  test('forwards the placeholder to the input', () => {
    const props = createProps({ placeholder: 'Search' });

    const { container } = render(<SearchBox {...props} />);

    expect(container.querySelector('.ais-SearchBox-input')).toHaveAttribute(
      'placeholder',
      'Search'
    );
  });

  test('forwards the `autoFocus` prop to the input', () => {
    const props = createProps({ autoFocus: true });

    const { container } = render(<SearchBox {...props} />);

    expect(within(container).getByRole('searchbox')).toHaveFocus();
  });

  test('with input value shows the reset button', () => {
    const props = createProps({ value: 'query' });

    const { container } = render(<SearchBox {...props} />);

    expect(container.querySelector('.ais-SearchBox-reset')).toBeVisible();
  });

  test('without input value hides the reset button', () => {
    const props = createProps({ value: '' });

    const { container } = render(<SearchBox {...props} />);

    expect(container.querySelector('.ais-SearchBox-reset')).not.toBeVisible();
  });

  test('with search stalled hides the reset indicator', () => {
    const props = createProps({ value: 'query', isSearchStalled: true });

    const { container } = render(<SearchBox {...props} />);

    expect(container.querySelector('.ais-SearchBox-reset')).not.toBeVisible();
  });

  test('with search stalled shows the loading indicator', () => {
    const props = createProps({ isSearchStalled: true });

    const { container } = render(<SearchBox {...props} />);

    expect(
      container.querySelector('.ais-SearchBox-loadingIndicator')
    ).toBeVisible();
  });

  describe('onSubmit', () => {
    test('calls an `onSubmit` callback when pressing `Enter` on the input element', () => {
      const props = createProps({});

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.ais-SearchBox-input'
      )!;

      userEvent.type(input, 'query');
      expect(props.onSubmit).toHaveBeenCalledTimes(0);

      userEvent.type(input, '{enter}');
      expect(props.onSubmit).toHaveBeenCalledTimes(1);
    });

    test('triggers `submit` event on current form when pressing `Enter` on the input element', () => {
      const formRef = createRef<HTMLFormElement>();
      const props = createProps({ formRef });

      const { container } = render(<SearchBox {...props} />);

      const form = formRef.current;
      const listenerSpy = jest.fn();
      if (form) {
        form.addEventListener('submit', listenerSpy);
      }

      const input = container.querySelector<HTMLInputElement>(
        '.ais-SearchBox-input'
      )!;

      userEvent.type(input, 'query');
      expect(listenerSpy).toHaveBeenCalledTimes(0);

      userEvent.type(input, '{enter}');
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    test('blurs input onSubmit', () => {
      const props = createProps({});

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.ais-SearchBox-input'
      )!;

      userEvent.type(input, 'query');
      expect(document.activeElement).toBe(props.inputRef.current);

      userEvent.type(input, '{enter}');
      expect(document.activeElement).not.toBe(props.inputRef.current);
    });
  });

  describe('onReset', () => {
    test('calls an `onReset` callback when clicking the reset button', () => {
      const props = createProps({});

      const { container } = render(<SearchBox {...props} />);
      const resetButton = container.querySelector<HTMLButtonElement>(
        '.ais-SearchBox-reset'
      )!;
      const input = container.querySelector<HTMLInputElement>(
        '.ais-SearchBox-input'
      )!;

      userEvent.type(input, 'query');
      expect(props.onReset).toHaveBeenCalledTimes(0);

      userEvent.click(resetButton);
      expect(props.onReset).toHaveBeenCalledTimes(1);
    });

    test('focuses input onReset', () => {
      const props = createProps({});

      const { container } = render(<SearchBox {...props} />);
      const resetButton = container.querySelector<HTMLButtonElement>(
        '.ais-SearchBox-reset'
      )!;
      const input = container.querySelector<HTMLInputElement>(
        '.ais-SearchBox-input'
      )!;

      userEvent.type(input, 'query');
      expect(document.activeElement).toBe(props.inputRef.current);

      userEvent.click(resetButton);
      expect(document.activeElement).toBe(props.inputRef.current);
    });
  });

  describe('onChange', () => {
    test('calls an `onChange` callback when changing the input value', () => {
      const props = createProps({});

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.ais-SearchBox-input'
      )!;

      userEvent.type(input, 'query');
      expect(props.onChange).toHaveBeenCalledTimes(5);
    });
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomSearchBox',
      classNames: {
        root: 'ROOT',
        form: 'FORM',
        input: 'INPUT',
        submit: 'SUBMIT',
        reset: 'RESET',
        loadingIndicator: 'LOADINGINDICATOR',
        submitIcon: 'SUBMITICON',
        resetIcon: 'RESETICON',
        loadingIcon: 'LOADINGICON',
      },
    });
    const { container } = render(<SearchBox {...props} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-SearchBox ROOT MyCustomSearchBox"
        >
          <form
            action=""
            class="ais-SearchBox-form FORM"
            novalidate=""
            role="search"
          >
            <input
              aria-label="Search"
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              class="ais-SearchBox-input INPUT"
              maxlength="512"
              placeholder=""
              spellcheck="false"
              type="search"
              value=""
            />
            <button
              class="ais-SearchBox-submit SUBMIT"
              title="Submit the search query."
              type="submit"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-submitIcon SUBMITICON"
                height="10"
                viewBox="0 0 40 40"
                width="10"
              >
                <path
                  d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
                />
              </svg>
            </button>
            <button
              class="ais-SearchBox-reset RESET"
              hidden=""
              title="Clear the search query."
              type="reset"
            >
              <svg
                aria-hidden="true"
                class="ais-SearchBox-resetIcon RESETICON"
                height="10"
                viewBox="0 0 20 20"
                width="10"
              >
                <path
                  d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
                />
              </svg>
            </button>
            <span
              class="ais-SearchBox-loadingIndicator LOADINGINDICATOR"
              hidden=""
            >
              <svg
                aria-hidden="true"
                aria-label="Results are loading"
                class="ais-SearchBox-loadingIcon LOADINGICON"
                height="16"
                stroke="#444"
                viewBox="0 0 38 38"
                width="16"
              >
                <g
                  fill="none"
                  fill-rule="evenodd"
                >
                  <g
                    stroke-width="2"
                    transform="translate(1 1)"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="18"
                      stroke-opacity=".5"
                    />
                    <path
                      d="M36 18c0-9.94-8.06-18-18-18"
                    >
                      <animatetransform
                        attributeName="transform"
                        dur="1s"
                        from="0 18 18"
                        repeatCount="indefinite"
                        to="360 18 18"
                        type="rotate"
                      />
                    </path>
                  </g>
                </g>
              </svg>
            </span>
          </form>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to root component', () => {
    const props = createProps({ style: { display: 'none' } });
    const { container } = render(<SearchBox {...props} />);

    expect(container.querySelector('.ais-SearchBox')).toHaveStyle({
      display: 'none',
    });
  });
});
