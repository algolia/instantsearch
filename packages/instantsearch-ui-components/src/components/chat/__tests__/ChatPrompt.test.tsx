/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createChatPromptComponent } from '../ChatPrompt';

const ChatPrompt = createChatPromptComponent({
  createElement,
  Fragment,
});

describe('ChatPrompt', () => {
  test('renders with default props', () => {
    const { container } = render(<ChatPrompt />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <form
          class="ais-ChatPrompt"
        >
          <div
            class="ais-ChatPrompt-body"
          >
            <textarea
              aria-label="Type your message..."
              class="ais-ChatPrompt-textarea"
              placeholder="Type your message..."
              rows="2"
              style="max-height: 12em; resize: none; overflow: auto;"
            />
            <div
              class="ais-ChatPrompt-actions"
            >
              <button
                class="ais-ChatPrompt-submit"
                data-status="ready"
                disabled=""
                title="Message is empty"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    clipRule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    `);
  });

  test('renders with header and footer components with classNames', () => {
    const Header = () => <header>Header</header>;
    const Footer = () => <footer>Footer</footer>;
    const { container } = render(
      <ChatPrompt
        classNames={{
          root: 'root',
          header: 'header',
          body: 'body',
          textarea: 'textarea',
          actions: 'actions',
          submit: 'submit',
          footer: 'footer',
        }}
        headerComponent={Header}
        footerComponent={Footer}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <form
          class="ais-ChatPrompt root"
        >
          <div
            class="ais-ChatPrompt-header header"
          >
            <header>
              Header
            </header>
          </div>
          <div
            class="ais-ChatPrompt-body body"
          >
            <textarea
              aria-label="Type your message..."
              class="ais-ChatPrompt-textarea textarea"
              placeholder="Type your message..."
              rows="2"
              style="max-height: 12em; resize: none; overflow: auto;"
            />
            <div
              class="ais-ChatPrompt-actions actions"
            >
              <button
                class="ais-ChatPrompt-submit submit"
                data-status="ready"
                disabled=""
                title="Message is empty"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    clipRule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            class="ais-ChatPrompt-footer footer"
          >
            <footer>
              Footer
            </footer>
          </div>
        </form>
      </div>
    `);
  });

  test('renders with user handlers and value props', () => {
    const onInput = jest.fn();
    const onSubmit = jest.fn();
    const onStop = jest.fn();
    const { container } = render(
      <ChatPrompt
        value="Hello"
        placeholder="Test placeholder"
        onInput={onInput}
        onSubmit={onSubmit}
        onStop={onStop}
      />
    );

    const textarea = container.querySelector('textarea')!;
    const button = container.querySelector('button')!;
    expect(textarea).toHaveValue('Hello');
    expect(textarea).toHaveAttribute('placeholder', 'Test placeholder');
    expect(button).not.toBeDisabled();

    userEvent.type(textarea, ' World');
    expect(onInput).toHaveBeenCalledTimes(6);
    expect(textarea).toHaveValue('Hello World');

    userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(0);
  });
});
