import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('VoiceSearch', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
        })
      );
    })
  )
  .add(
    'without status',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
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
        instantsearch.widgets.voiceSearch({
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
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
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
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
          templates: {
            status: `
              <p>status: {{status}}</p>
              <p>errorCode: {{errorCode}}</p>
              <p>isListening: {{isListening}}</p>
              <p>transcript: {{transcript}}</p>
              <p>isSpeechFinal: {{isSpeechFinal}}</p>
            `,
          },
        })
      );
    })
  )
  .add(
    'search as you speak',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
          searchAsYouSpeak: true,
          templates: {
            status: `
              <p>status: {{status}}</p>
              <p>errorCode: {{errorCode}}</p>
              <p>isListening: {{isListening}}</p>
              <p>transcript: {{transcript}}</p>
              <p>isSpeechFinal: {{isSpeechFinal}}</p>
          `,
          },
        })
      );
    })
  )
  .add(
    'disabled by default on unsupported browser (open this in Safari, Firefox, ...)',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
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
        `.voice-search-button {
          border: none;
          background: none;
          position: absolute;
          right: 40px;
          top: 52px;
          z-index: 3;
        }`,
        `.voice-search-button svg {
          fill: #666;
        }`,
        `.voice-search-button:hover {
          cursor: pointer;
        }`,
        `.voice-search-button:hover .listening-false svg {
          fill: #444;
        }`,
        `.voice-search-button .listening-true svg {
          fill: #d83636;
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
      ].forEach(rule => style.sheet.insertRule(rule));

      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container: subContainer1,
          cssClasses: {
            button: 'voice-search-button',
            status: 'voice-search-status',
          },
          templates: {
            buttonText: `
              <span class="listening-{{isListening}}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
              </span>
            `,
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
