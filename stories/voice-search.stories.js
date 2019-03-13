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
            buttonText({ isStarted }) {
              if (isStarted) {
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
    'display status',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
          templates: {
            status: `
              <p>status: {{status}}</p>
              <p>isStarted: {{isStarted}}</p>
            `,
          },
        })
      );
    })
  )
  .add(
    'display transcript',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
          templates: {
            transcript({ transcript, isSpeechFinal }) {
              if (isSpeechFinal) {
                return `Final Transcript: ${transcript}`;
              } else {
                return `Interim Transcript: ${transcript}`;
              }
            },
          },
        })
      );
    })
  )
  .add(
    'search after speech is finished',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container,
          searchAsYouSpeak: false,
          templates: {
            status: `isStarted: {{isStarted}}`,
            transcript({ transcript, isSpeechFinal }) {
              if (isSpeechFinal) {
                return `Final Transcript: ${transcript}`;
              } else {
                return `Not done yet`;
              }
            },
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
        `.voice-search-button:hover .started-false svg {
          fill: #444;
        }`,
        `.voice-search-button .started-true svg {
          fill: #d83636;
        }`,
        `.voice-search-transcript .layer {
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
        `.voice-search-transcript .layer.started-true {
          display: flex;
        }`,
        `.voice-search-transcript .layer span {
          font-size: 2rem;
          color: #555;
        }`,
      ].forEach(rule => style.sheet.insertRule(rule));

      search.addWidget(
        instantsearch.widgets.voiceSearch({
          container: subContainer1,
          cssClasses: {
            button: 'voice-search-button',
            transcript: 'voice-search-transcript',
          },
          templates: {
            buttonText: `
              <span class="started-{{isStarted}}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
              </span>
            `,
            transcript({ isStarted, transcript }) {
              return `
                <div class="layer started-${isStarted}">
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
