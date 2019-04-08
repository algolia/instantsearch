import React from 'react';
import { mount } from 'enzyme';
import VoiceSearch from '../VoiceSearch';

const defaultProps = {
  cssClasses: {
    root: 'root',
    button: 'button',
    status: 'status',
  },
  searchAsYouSpeak: false,
  isSupportedBrowser: true,
  isListening: false,
  toggleListening: () => {},
  voiceListeningState: {
    status: 'initial',
    transcript: undefined,
    isSpeechFinal: undefined,
    errorCode: undefined,
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
      expect(props.toggleListening).toHaveBeenCalledWith({
        searchAsYouSpeak: props.searchAsYouSpeak,
      });
    });
  });

  describe('Rendering', () => {
    it('with default props', () => {
      expect(mount(<VoiceSearch {...defaultProps} />)).toMatchSnapshot();
    });

    it('button disabled in unsupported browser', () => {
      const props = {
        ...defaultProps,
        isSupportedBrowser: false,
      };
      const wrapper = mount(<VoiceSearch {...props} />);
      expect(wrapper.find('button').props().disabled).toBe(true);
    });

    it('with full props and custom templates', () => {
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
          buttonText: ({ isListening }) => (isListening ? 'Stop' : 'Start'),
          status: `
            <p>status: {{status}}</p>
            <p>errorCode: {{errorCode}}</p>
            <p>isListening: {{isListening}}</p>
            <p>transcript: {{transcript}}</p>
            <p>isSpeechFinal: {{isSpeechFinal}}</p>
            <p>isSupportedBrowser: {{isSupportedBrowser}}</p>
          `,
        },
      };
      expect(mount(<VoiceSearch {...props} />)).toMatchSnapshot();
    });
  });
});
