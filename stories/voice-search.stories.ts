import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import voiceSearch from '../src/widgets/voice-search/voice-search';

storiesOf('VoiceSearch', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const descContainer = document.createElement('div');
      const realContainer = document.createElement('div');
      container.appendChild(descContainer);
      container.appendChild(realContainer);
      descContainer.innerHTML = `
        <p>To see this button disabled, test it on unsupported browsers like Safari, Firefox, etc.</p>
      `;

      search.addWidget(
        voiceSearch({
          container: realContainer,
        })
      );
    })
  )
  .add(
    'without status',
    withHits(({ search, container }) => {
      search.addWidget(
        voiceSearch({
          container,
          templates: {
            status: ``,
          },
        })
      );
    })
  )

  .add(
    'with a SearchBox',
    withHits(({ search, container, instantsearch }) => {
      const subContainer1 = document.createElement('div');
      const subContainer2 = document.createElement('div');
      container.appendChild(subContainer1);
      container.appendChild(subContainer2);

      search.addWidget(
        voiceSearch({
          container: subContainer1,
        })
      );
      search.addWidget(
        instantsearch.widgets.searchBox({
          container: subContainer2,
        })
      );
    })
  )
  .add(
    'with a custom button text',
    withHits(({ search, container }) => {
      search.addWidget(
        voiceSearch({
          container,
          templates: {
            buttonText({ isListening }) {
              if (isListening) {
                return 'Click to Stop';
              } else {
                return 'Click to Speak';
              }
            },
          },
        })
      );
    })
  )
  .add(
    'with full status',
    withHits(({ search, container }) => {
      search.addWidget(
        voiceSearch({
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
        })
      );
    })
  )
  .add(
    'search as you speak',
    withHits(({ search, container }) => {
      search.addWidget(
        voiceSearch({
          container,
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
        })
      );
    })
  )
  .add(
    'example of dynamic UI working with SearchBox',
    withHits(({ search, container, instantsearch }) => {
      const subContainer1 = document.createElement('div');
      const subContainer2 = document.createElement('div');
      container.appendChild(subContainer1);
      container.appendChild(subContainer2);

      const style = window.document.createElement('style');
      window.document.head.appendChild(style);
      [
        `.ais-VoiceSearch-button{border:none;width:24px;height:24px;padding:4px;border-radius:50%;color:#3a4570;background-color:transparent}`,
        `.ais-VoiceSearch-button svg{color:currentColor}`,
        `.ais-VoiceSearch-button:hover{cursor:pointer;background-color:#a5aed1;color:#fff}`,
        `.ais-VoiceSearch-button:disabled{color:#a5aed1}`,
        `.ais-VoiceSearch-button:disabled:hover{color:#a5aed1;cursor:not-allowed;background:inherit}`,
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
      ].forEach(rule => (style.sheet as CSSStyleSheet).insertRule(rule));

      search.addWidget(
        voiceSearch({
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
        })
      );
      search.addWidget(
        instantsearch.widgets.searchBox({
          container: subContainer2,
          showReset: false,
          showLoadingIndicator: false,
        })
      );
    })
  );
