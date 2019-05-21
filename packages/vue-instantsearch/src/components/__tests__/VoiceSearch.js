import VoiceSearch from '../VoiceSearch.vue';
import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');

const defaultState = {
  voiceListeningState: {
    status: 'initial',
    transcript: undefined,
    isSpeechFinal: undefined,
    errorCode: undefined,
  },
  isBrowserSupported: true,
  isListening: false,
  toggleListening: jest.fn(),
};

const buttonTextScopedSlot = `
  <span slot-scope="{ isListening }">
    {{isListening ? "Stop": "Start"}}
  </span>
`;

describe('button', () => {
  it('calls toggleListening when the button is clicked', () => {
    __setState(defaultState);
    const wrapper = mount(VoiceSearch);
    wrapper.find('button').trigger('click');
    expect(wrapper.vm.state.toggleListening).toHaveBeenCalledTimes(1);
  });
});

describe('Rendering', () => {
  it('renders default template correctly', () => {
    __setState(defaultState);
    const wrapper = mount(VoiceSearch);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('display the button as disabled on unsupported browser', () => {
    __setState({
      ...defaultState,
      isBrowserSupported: false,
    });
    const wrapper = mount(VoiceSearch);
    expect(wrapper.find('button').attributes().disabled).toBe('disabled');
  });

  it('with custom template for buttonText (1)', () => {
    __setState({
      ...defaultState,
      isListening: true,
    });
    const wrapper = mount(VoiceSearch, {
      scopedSlots: {
        buttonText: buttonTextScopedSlot,
      },
    });
    expect(wrapper.find('button').text()).toBe('Stop');
  });

  it('with custom template for buttonText (2)', () => {
    __setState({
      ...defaultState,
      isListening: false,
    });
    const wrapper = mount(VoiceSearch, {
      scopedSlots: {
        buttonText: buttonTextScopedSlot,
      },
    });
    expect(wrapper.find('button').text()).toBe('Start');
  });

  it('with custom template for status', () => {
    __setState({
      voiceListeningState: {
        status: 'recognizing',
        transcript: 'Hello',
        isSpeechFinal: false,
        errorCode: undefined,
      },
      isBrowserSupported: true,
      isListening: true,
      toggleListening: jest.fn(),
    });
    const wrapper = mount(VoiceSearch, {
      scopedSlots: {
        status: `
          <div slot-scope="{ status, errorCode, isListening, transcript, isSpeechFinal, isBrowserSupported }">
            <p>status: {{status}}</p>
            <p>errorCode: {{errorCode}}</p>
            <p>isListening: {{isListening}}</p>
            <p>transcript: {{transcript}}</p>
            <p>isSpeechFinal: {{isSpeechFinal}}</p>
            <p>isBrowserSupported: {{isBrowserSupported}}</p>
          </div>
        `,
      },
    });
    expect(wrapper.find('.ais-VoiceSearch-status').html()).toMatchSnapshot();
  });
});
