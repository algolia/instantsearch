/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { createElement, createRef, Fragment } from 'preact';

import { createSearchBoxComponent } from '../SearchBox';

import type { SearchBoxProps } from '../SearchBox';

describe('SearchBox', () => {
  const SearchBox = createSearchBoxComponent({ createElement, Fragment });

  function createProps(props: Partial<SearchBoxProps> = {}): SearchBoxProps {
    return { value: '', ...props };
  }

  test('renders the default markup', () => {
    const { container } = render(<SearchBox {...createProps()} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
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
          />
          <button
            aria-label="Submit the search query"
            class="ais-SearchBox-submit"
            title="Submit the search query"
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
            aria-label="Clear the search query"
            class="ais-SearchBox-reset"
            hidden=""
            title="Clear the search query"
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
    `);
  });

  test('shows the reset button only with a non-blank query', () => {
    const { container, rerender } = render(
      <SearchBox {...createProps({ value: '   ' })} />
    );
    const reset = () =>
      container.querySelector<HTMLButtonElement>('.ais-SearchBox-reset')!;

    expect(reset().hidden).toBe(true);

    rerender(<SearchBox {...createProps({ value: 'apple' })} />);
    expect(reset().hidden).toBe(false);

    rerender(
      <SearchBox {...createProps({ value: 'apple', showReset: false })} />
    );
    expect(reset().hidden).toBe(true);
  });

  test('hides the reset button and shows the loader while stalled, keeping the submit button', () => {
    const { container } = render(
      <SearchBox {...createProps({ value: 'apple', isSearchStalled: true })} />
    );

    expect(
      container.querySelector<HTMLButtonElement>('.ais-SearchBox-submit')!
        .hidden
    ).toBe(false);
    expect(
      container.querySelector<HTMLButtonElement>('.ais-SearchBox-reset')!.hidden
    ).toBe(true);
    expect(
      container.querySelector<HTMLElement>('.ais-SearchBox-loadingIndicator')!
        .hidden
    ).toBe(false);
  });

  test('hides the submit button and omits the loader with options', () => {
    const { container } = render(
      <SearchBox
        {...createProps({ showSubmit: false, showLoadingIndicator: false })}
      />
    );

    expect(
      container.querySelector<HTMLButtonElement>('.ais-SearchBox-submit')!
        .hidden
    ).toBe(true);
    expect(
      container.querySelector('.ais-SearchBox-loadingIndicator')
    ).toBeNull();
  });

  test('renders the AI mode button before the loading indicator', () => {
    const onAiModeClick = jest.fn();
    const { container } = render(
      <SearchBox
        {...createProps({
          onAiModeClick,
          classNames: { aiModeButton: 'AI', aiModeLabel: 'AI_LABEL' },
        })}
      />
    );
    const button =
      container.querySelector<HTMLButtonElement>('.ais-AiModeButton')!;

    expect(button).toHaveClass('AI');
    expect(button).toHaveAttribute('title', 'AI Mode');
    expect(button.nextElementSibling).toHaveClass(
      'ais-SearchBox-loadingIndicator'
    );
    expect(container.querySelector('.ais-AiModeButton-label')).toHaveClass(
      'AI_LABEL'
    );
    expect(
      container.querySelector('.ais-AiModeButton-label')
    ).toHaveTextContent('AI Mode');

    fireEvent.click(button);
    expect(onAiModeClick).toHaveBeenCalledTimes(1);
  });

  test('applies translations and class names', () => {
    const { container } = render(
      <SearchBox
        {...createProps({
          translations: {
            submitButtonTitle: 'Go',
            resetButtonTitle: 'Clear',
            inputAriaLabel: 'Find',
          },
          classNames: { root: 'ROOT', input: 'INPUT', submitIcon: 'ICON' },
        })}
      />
    );

    expect(container.firstChild).toHaveClass('ais-SearchBox', 'ROOT');
    expect(container.querySelector('input')).toHaveClass('INPUT');
    expect(container.querySelector('input')).toHaveAttribute(
      'aria-label',
      'Find'
    );
    expect(container.querySelector('.ais-SearchBox-submit')).toHaveAttribute(
      'title',
      'Go'
    );
    expect(container.querySelector('.ais-SearchBox-reset')).toHaveAttribute(
      'aria-label',
      'Clear'
    );
    expect(container.querySelector('.ais-SearchBox-submitIcon')).toHaveClass(
      'ICON'
    );
  });

  test('renders custom icons', () => {
    const { container } = render(
      <SearchBox
        {...createProps({
          submitIconComponent: () => <span>SUBMIT</span>,
          resetIconComponent: () => <span>RESET</span>,
          loadingIconComponent: () => <span>LOADING</span>,
          aiModeComponent: () => <span>AI</span>,
          onAiModeClick: () => {},
        })}
      />
    );

    expect(container.querySelector('.ais-SearchBox-submit')).toHaveTextContent(
      'SUBMIT'
    );
    expect(container.querySelector('.ais-SearchBox-reset')).toHaveTextContent(
      'RESET'
    );
    expect(
      container.querySelector('.ais-SearchBox-loadingIndicator')
    ).toHaveTextContent('LOADING');
    expect(container.querySelector('.ais-AiModeButton')!.innerHTML).toBe(
      '<span>AI</span>'
    );
  });

  test('blurs the input on submit and focuses it on reset', () => {
    const onSubmit = jest.fn();
    const onReset = jest.fn();
    const inputRef = createRef<HTMLInputElement>();
    const { container } = render(
      <SearchBox
        {...createProps({ value: 'a', inputRef, onSubmit, onReset })}
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    const input = container.querySelector('input')!;

    input.focus();
    fireEvent.submit(container.querySelector('form')!);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(input);

    fireEvent.reset(container.querySelector('form')!);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
  });
});
