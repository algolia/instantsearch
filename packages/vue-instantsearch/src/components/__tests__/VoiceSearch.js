/**
 * @jest-environment jsdom
 */

import VoiceSearch from '../VoiceSearch.vue';
import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

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

const buttonTextSlot = `
  <template v-slot:buttonText="{ isListening }">
    <span>
      {{isListening ? "Stop": "Start"}}
    </span>
  </template>
`;

describe('button', () => {
  it('calls toggleListening when the button is clicked', async () => {
    __setState(defaultState);
    const wrapper = mount(VoiceSearch);
    await wrapper.find('button').trigger('click');
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
    expect(wrapper.find('button')).vueToBeDisabled();
  });

  it('with custom template for buttonText (1)', () => {
    __setState({
      ...defaultState,
      isListening: true,
    });
    const wrapper = mount({
      components: { VoiceSearch },
      template: `
        <VoiceSearch>
          ${buttonTextSlot}
        </VoiceSearch>
      `,
    });
    expect(wrapper.find('button').text()).toBe('Stop');
  });

  it('with custom template for buttonText (2)', () => {
    __setState({
      ...defaultState,
      isListening: false,
    });
    const wrapper = mount({
      components: { VoiceSearch },
      template: `
        <VoiceSearch>
          ${buttonTextSlot}
        </VoiceSearch>
      `,
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
    const wrapper = mount({
      components: { VoiceSearch },
      template: `
        <VoiceSearch>
          <template v-slot:status="{ status, errorCode, isListening, transcript, isSpeechFinal, isBrowserSupported }">
            <div>
              <p>status: {{status}}</p>
              <p>errorCode: {{errorCode}}</p>
              <p>isListening: {{isListening}}</p>
              <p>transcript: {{transcript}}</p>
              <p>isSpeechFinal: {{isSpeechFinal}}</p>
              <p>isBrowserSupported: {{isBrowserSupported}}</p>
            </div>
          </template>
        </VoiceSearch>
      `,
    });
    expect(wrapper.find('.ais-VoiceSearch-status').html()).toMatchSnapshot();
  });
});
