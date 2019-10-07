/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import VoiceSearch, { VoiceSearchProps } from '../VoiceSearch';

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
      const props = {
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
      const props = {
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
  });
});
