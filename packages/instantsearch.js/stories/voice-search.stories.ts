import { withHits } from '../.storybook/decorators';

import type { VoiceSearchWidget } from '../src/widgets/voice-search/voice-search';
import type { Meta, StoryObj } from '@storybook/html';

type Args = {
  widgetParams: Partial<Parameters<VoiceSearchWidget>[0]>;
};

const meta: Meta<Args> = {
  title: 'Basics/VoiceSearch',
  render: (args) =>
    withHits(({ search, container, instantsearch }) => {
      const descContainer = document.createElement('div');
      const realContainer = document.createElement('div');
      container.appendChild(descContainer);
      container.appendChild(realContainer);
      descContainer.innerHTML = `
      <p>To see this button disabled, test it on unsupported browsers like Safari, Firefox, etc.</p>
    `;

      search.addWidgets([
        instantsearch.widgets.voiceSearch({
          container: realContainer,
          ...args.widgetParams,
        }),
      ]);
    })(),
};

export default meta;

export const Default: StoryObj<Args> = {};

export const WithoutStatus: StoryObj<Args> = {
  args: {
    widgetParams: {
      templates: {
        status: '',
      },
    },
  },
};

export const WithASearchBox: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
    const subContainer1 = document.createElement('div');
    const subContainer2 = document.createElement('div');
    container.appendChild(subContainer1);
    container.appendChild(subContainer2);

    search.addWidgets([
      instantsearch.widgets.voiceSearch({
        container: subContainer1,
      }),
    ]);
    search.addWidgets([
      instantsearch.widgets.searchBox({
        container: subContainer2,
      }),
    ]);
  }),
};

export const WithCustomButtonText: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    [
      `.ais-VoiceSearch-button.custom-button:hover {
        background: inherit;
      }`,
    ].forEach((rule) => (style.sheet as CSSStyleSheet).insertRule(rule));

    search.addWidgets([
      instantsearch.widgets.voiceSearch({
        container,
        templates: {
          buttonText({ isListening }) {
            return isListening ? '⏹' : '🎙';
          },
        },
        cssClasses: {
          button: 'custom-button',
        },
      }),
    ]);
  }),
};

export const WithAFullStatus: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
    search.addWidgets([
      instantsearch.widgets.voiceSearch({
        container,
        templates: {
          status: `
            <p>status: {{status}}</p>
            <p>errorCode: {{errorCode}}</p>
            <p>isListening: {{isListening}}</p>
            <p>transcript: {{transcript}}</p>
            <p>isSpeechFinal: {{isSpeechFinal}}</p>
            <p>isBrowserSupported: {{isBrowserSupported}}</p>
          `,
        },
      }),
    ]);
  }),
};

export const SearchAsYouSpeak: StoryObj<Args> = {
  args: {
    widgetParams: {
      searchAsYouSpeak: true,
      templates: {
        status: `
          <p>status: {{status}}</p>
          <p>errorCode: {{errorCode}}</p>
          <p>isListening: {{isListening}}</p>
          <p>transcript: {{transcript}}</p>
          <p>isSpeechFinal: {{isSpeechFinal}}</p>
          <p>isBrowserSupported: {{isBrowserSupported}}</p>
        `,
      },
    },
  },
};

export const ExampleOfDynamicUIWorkingWithSearchBox: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
    const subContainer1 = document.createElement('div');
    const subContainer2 = document.createElement('div');
    container.appendChild(subContainer1);
    container.appendChild(subContainer2);

    const style = document.createElement('style');
    document.head.appendChild(style);
    [
      `.voice-search-button {
          position: absolute;
          right: 43px;
          top: 53px;
          z-index: 3;
        }`,
      `.voice-search-status .layer {
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
      `.voice-search-status .layer.listening-true {
          display: flex;
        }`,
      `.voice-search-status .layer span {
          font-size: 2rem;
          color: #555;
        }`,
    ].forEach((rule) => (style.sheet as CSSStyleSheet).insertRule(rule));

    search.addWidgets([
      instantsearch.widgets.voiceSearch({
        container: subContainer1,
        cssClasses: {
          button: 'voice-search-button',
          status: 'voice-search-status',
        },
        templates: {
          status({ isListening, transcript }) {
            return `
              <div class="layer listening-${isListening}">
                <span>${transcript}</span>
              </div>
            `;
          },
        },
      }),
    ]);
    search.addWidgets([
      instantsearch.widgets.searchBox({
        container: subContainer2,
        showReset: false,
        showLoadingIndicator: false,
      }),
    ]);
  }),
};

export const WithAdditionalParameters: StoryObj<Args> = {
  render: withHits(({ search, container, instantsearch }) => {
    const descContainer = document.createElement('div');
    const realContainer = document.createElement('div');
    container.appendChild(descContainer);
    container.appendChild(realContainer);
    descContainer.innerHTML = `
      <p>Sets the default additional parameters, as well as a language</p>
    `;

    search.addWidgets([
      instantsearch.widgets.voiceSearch({
        container: realContainer,
        language: 'en-US',
        additionalQueryParameters: () => {},
      }),
    ]);
  }),
};
