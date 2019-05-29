<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot v-bind="rootSlotProps">
      <button
        type="button"
        :class="suit('button')"
        :title="state.isBrowserSupported ? buttonTitle : disabledButtonTitle"
        :disabled="!state.isBrowserSupported"
        @click="handleClick"
      >
        <slot
          name="buttonText"
          v-bind="innerSlotProps"
        >
          <svg
            v-bind="buttonSvgAttrs"
            v-if="errorNotAllowed"
          >
            <line
              x1="1"
              y1="1"
              x2="23"
              y2="23"
            />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line
              x1="12"
              y1="19"
              x2="12"
              y2="23"
            />
            <line
              x1="8"
              y1="23"
              x2="16"
              y2="23"
            />
          </svg>
          <svg
            v-bind="buttonSvgAttrs"
            v-else
          >
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              :fill="state.isListening ? 'currentColor' : 'none'"
            />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line
              x1="12"
              y1="19"
              x2="12"
              y2="23"
            />
            <line
              x1="8"
              y1="23"
              x2="16"
              y2="23"
            />
          </svg>
        </slot>
      </button>
      <div :class="suit('status')">
        <slot
          name="status"
          v-bind="innerSlotProps"
        >
          <p>{{ state.voiceListeningState.transcript }}</p>
        </slot>
      </div>
    </slot>
  </div>
</template>

<script>
import { connectVoiceSearch } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisVoiceSearch',
  mixins: [
    createWidgetMixin({ connector: connectVoiceSearch }),
    createSuitMixin({ name: 'VoiceSearch' }),
  ],
  props: {
    searchAsYouSpeak: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    buttonTitle: {
      type: String,
      required: false,
      default: 'Search by voice',
    },
    disabledButtonTitle: {
      type: String,
      required: false,
      default: 'Search by voice (not supported on this browser)',
    },
  },
  data() {
    return {
      buttonSvgAttrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    };
  },
  computed: {
    widgetParams() {
      return {
        searchAsYouSpeak: this.searchAsYouSpeak,
      };
    },
    errorNotAllowed() {
      return (
        this.state.voiceListeningState.status === 'error' &&
        this.state.voiceListeningState.errorCode === 'not-allowed'
      );
    },
    rootSlotProps() {
      return {
        isBrowserSupported: this.state.isBrowserSupported,
        isListening: this.state.isListening,
        toggleListening: this.state.toggleListening,
        voiceListeningState: this.state.voiceListeningState,
      };
    },
    innerSlotProps() {
      return {
        status: this.state.voiceListeningState.status,
        errorCode: this.state.voiceListeningState.errorCode,
        isListening: this.state.isListening,
        transcript: this.state.voiceListeningState.transcript,
        isSpeechFinal: this.state.voiceListeningState.isSpeechFinal,
        isBrowserSupported: this.state.isBrowserSupported,
      };
    },
  },
  methods: {
    handleClick(event) {
      event.currentTarget.blur();
      this.state.toggleListening();
    },
  },
};
</script>
