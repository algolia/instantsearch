import React from 'react';
import { mount } from 'enzyme';
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
      const wrapper = mount(<VoiceSearch {...props} />);
      wrapper.find('button').simulate('click');
      expect(props.toggleListening).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rendering', () => {
    it('with default props', () => {
      expect(mount(<VoiceSearch {...defaultProps} />)).toMatchSnapshot();
    });

    it('button disabled in unsupported browser', () => {
      const props = {
        ...defaultProps,
        isBrowserSupported: false,
      };
      const wrapper = mount(<VoiceSearch {...props} />);
      expect(wrapper.find('button').props().disabled).toBe(true);
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
      const wrapper = mount(<VoiceSearch {...props} />);
      expect(wrapper.find('button').text()).toBe('Stop');
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
      const wrapper = mount(<VoiceSearch {...props} />);
      expect(wrapper.find('button').text()).toBe('Start');
    });

    it('with custom template for status', () => {
      const props = {
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
      const wrapper = mount(<VoiceSearch {...props} />);
      expect(wrapper.find('.status')).toMatchSnapshot();
    });
  });
});
