/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import type { VoiceSearchProps } from '../VoiceSearch';
import VoiceSearch from '../VoiceSearch';

const defaultProps: VoiceSearchProps = {
  cssClasses: {
    root: 'root',
    button: 'button',
    status: 'status',
  },
  isBrowserSupported: true,
  isListening: false,
  toggleListening: () => {},
  voiceListeningState: {
    status: 'initial',
    isSpeechFinal: false,
    transcript: '',
  },
  templates: {
    buttonText: 'button',
    status: 'status',
  },
};

describe('VoiceSearch', () => {
  describe('button', () => {
    it('call toggleListening when button is clicked', () => {
      const props = {
        ...defaultProps,
        toggleListening: jest.fn(),
      };

      const { container } = render(<VoiceSearch {...props} />);
      const button = container.querySelector('button') as HTMLButtonElement;

      fireEvent.click(button);

      expect(props.toggleListening).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rendering', () => {
    it('with default props', () => {
      const { container } = render(<VoiceSearch {...defaultProps} />);

      expect(container).toMatchSnapshot();
    });

    it('button disabled in unsupported browser', () => {
      const props = {
        ...defaultProps,
        isBrowserSupported: false,
      };

      const { container } = render(<VoiceSearch {...props} />);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button).toBeDisabled();
    });

    it('with custom template for buttonText (1)', () => {
      const props: VoiceSearchProps = {
        ...defaultProps,
        isListening: true,
        templates: {
          buttonText: ({ isListening }) => (isListening ? 'Stop' : 'Start'),
          status: ``,
        },
      };

      const { container } = render(<VoiceSearch {...props} />);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button).toHaveTextContent('Stop');
    });

    it('with custom template for buttonText (2)', () => {
      const props: VoiceSearchProps = {
        ...defaultProps,
        isListening: false,
        templates: {
          buttonText: ({ isListening }) => (isListening ? 'Stop' : 'Start'),
          status: ``,
        },
      };

      const { container } = render(<VoiceSearch {...props} />);
      const button = container.querySelector('button') as HTMLButtonElement;

      expect(button).toHaveTextContent('Start');
    });

    it('with custom template for status', () => {
      const props: VoiceSearchProps = {
        ...defaultProps,
        isListening: true,
        voiceListeningState: {
          status: 'recognizing',
          transcript: 'Hello',
          isSpeechFinal: false,
          errorCode: undefined,
        },
        templates: {
          buttonText: ``,
          status: `
            <p>status: {{status}}</p>
            <p>errorCode: {{errorCode}}</p>
            <p>isListening: {{isListening}}</p>
            <p>transcript: {{transcript}}</p>
            <p>isSpeechFinal: {{isSpeechFinal}}</p>
            <p>isBrowserSupported: {{isBrowserSupported}}</p>
          `,
        },
      };

      const { container } = render(<VoiceSearch {...props} />);
      const status = container.querySelector('.status');

      expect(status).toMatchSnapshot();
    });

    it('renders component with custom `html` templates', () => {
      const { container } = render(
        <VoiceSearch
          {...defaultProps}
          templates={{
            buttonText({ isListening }, { html }) {
              return html`<span>${isListening ? 'Stop' : 'Start'}</span>`;
            },
            status({ isListening, status }, { html }) {
              return html`
                <div class="${isListening ? 'listening' : 'not-listening'}">
                  <span>${status}</span>
                </div>
              `;
            },
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <button
      class="button"
      title="Search by voice"
      type="button"
    >
      <span>
        Start
      </span>
    </button>
    <div
      class="status"
    >
      <div
        class="not-listening"
      >
        <span>
          initial
        </span>
      </div>
    </div>
  </div>
</div>
`);
    });
  });
});
