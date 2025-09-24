/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
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
              autofocus="true"
              class="ais-ChatPrompt-textarea ais-Scrollbar"
              data-max-rows="5"
              placeholder="Type your message..."
              style="height: auto; overflow-y: hidden;"
            />
            <div
              class="ais-ChatPrompt-actions"
            >
              <button
                aria-label="Message is empty"
                class="ais-ChatPrompt-submit"
                data-status="ready"
                disabled=""
                type="submit"
              >
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m5 12 7-7 7 7"
                  />
                  <path
                    d="M12 19V5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            class="ais-ChatPrompt-footer"
          >
            <div
              class="ais-ChatPrompt-disclaimer"
            >
              AI can make mistakes. Verify responses.
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
              autofocus="true"
              class="ais-ChatPrompt-textarea ais-Scrollbar textarea"
              data-max-rows="5"
              placeholder="Type your message..."
              style="height: auto; overflow-y: hidden;"
            />
            <div
              class="ais-ChatPrompt-actions actions"
            >
              <button
                aria-label="Message is empty"
                class="ais-ChatPrompt-submit submit"
                data-status="ready"
                disabled=""
                type="submit"
              >
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m5 12 7-7 7 7"
                  />
                  <path
                    d="M12 19V5"
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
