import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-voice-search', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <div>
        <p>To see this button disabled, test it on unsupported browsers like Safari, Firefox, etc.</p>
        <ais-voice-search></ais-voice-search>
      </div>
    `,
  }))
  .add('without status', () => ({
    template: `
      <ais-voice-search>
        <template v-slot:status><span></span></template>
      </ais-voice-search>
    `,
  }))
  .add('with a SearchBox', () => ({
    template: `
      <div>
        <ais-voice-search></ais-voice-search>
        <ais-search-box></ais-search-box>
      </div>
    `,
  }))
  .add('with a custom button text', () => {
    const style = window.document.createElement('style');
    window.document.head.appendChild(style);
    [
      `.custom-button-wrapper .ais-VoiceSearch-button:hover {
      background: inherit;
    }`,
    ].forEach((rule) => style.sheet.insertRule(rule));

    return {
      template: `
      <div class="custom-button-wrapper">
        <ais-voice-search>
          <template v-slot:buttonText="{ status, errorCode, isListening, transcript, isSpeechFinal, isBrowserSupported }">
            {{ isListening ? '⏹' : '🎙' }}
          </template>
        </ais-voice-search>
      </div>
    `,
    };
  })
  .add('with full status', () => ({
    template: `
      <ais-voice-search>
        <template v-slot:status="{ status, errorCode, isListening, transcript, isSpeechFinal, isBrowserSupported }">
          <p>status: {{status}}</p>
          <p>errorCode: {{errorCode}}</p>
          <p>isListening: {{isListening}}</p>
          <p>transcript: {{transcript}}</p>
          <p>isSpeechFinal: {{isSpeechFinal}}</p>
          <p>isBrowserSupported: {{isBrowserSupported}}</p>
        </template>
      </ais-voice-search>
    `,
  }))
  .add('search as you speak', () => ({
    template: `
      <ais-voice-search :search-as-you-speak="true">
        <template v-slot:status="{ status, errorCode, isListening, transcript, isSpeechFinal, isBrowserSupported }">
          <p>status: {{status}}</p>
          <p>errorCode: {{errorCode}}</p>
          <p>isListening: {{isListening}}</p>
          <p>transcript: {{transcript}}</p>
          <p>isSpeechFinal: {{isSpeechFinal}}</p>
          <p>isBrowserSupported: {{isBrowserSupported}}</p>
        </template>
      </ais-voice-search>
    `,
  }))
  .add('example of dynamic UI working with SearchBox', () => {
    const style = window.document.createElement('style');
    window.document.head.appendChild(style);
    [
      `.custom-ui .ais-VoiceSearch-button {
          position: absolute;
          right: 43px;
          top: 52px;
          z-index: 3;
        }`,
      `.custom-ui .ais-VoiceSearch-status .layer {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          align-items: center;
          justify-content: center;
          display: none;
        }`,
      `.custom-ui .ais-VoiceSearch-status .layer.listening-true {
          display: flex;
        }`,
      `.custom-ui .ais-VoiceSearch-status .layer span {
          font-size: 2rem;
          color: #555;
        }`,
    ].forEach((rule) => style.sheet.insertRule(rule));

    return {
      template: `
        <div class="custom-ui">
          <ais-voice-search>
            <template v-slot:status="{ isListening, transcript }">
              <div :class="'layer listening-' + isListening">
                <span>{{ transcript }}</span>
              </div>
            </template>
          </ais-voice-search>
          <ais-search-box>
            <template slot="reset-icon"></template>
            <template slot="loading-indicator"></template>
          </ais-search-box>
        </div>
    `,
    };
  })
  .add('with custom template for default slot', () => ({
    template: `
      <ais-voice-search>
        <template v-slot="{ isBrowserSupported, isListening, toggleListening, voiceListeningState }">
          <button @click="toggleListening()">click</button>
          <p>isListening: {{isListening ? 'true' : 'false'}}</p>
          <p>isBrowserSupported: {{isBrowserSupported ? 'true' : 'false'}}</p>
          <pre>voiceListeningState: {{JSON.stringify(voiceListeningState, null, 2)}}</pre>
        </template>
      </ais-voice-search>
    `,
  }));
