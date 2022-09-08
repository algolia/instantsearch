/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import voiceSearch from '../voice-search';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('voiceSearch', () => {
  describe('templates', () => {
    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        voiceSearch({
          container,
          templates: {
            buttonText({ isListening }, { html }) {
              return html`<span>${isListening ? 'Stop' : 'Start'}</span>`;
            },
            status({ isListening, status }, { html }) {
              return html`
                <div class="${isListening ? 'LISTENING' : 'NOT-LISTENING'}">
                  <span>${status}</span>
                </div>
              `;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-VoiceSearch"
  >
    <button
      class="ais-VoiceSearch-button"
      disabled=""
      title="Search by voice (not supported on this browser)"
      type="button"
    >
      <span>
        Start
      </span>
    </button>
    <div
      class="ais-VoiceSearch-status"
    >
      <div
        class="NOT-LISTENING"
      >
        <span>
          initial
        </span>
      </div>
    </div>
  </div>
</div>
`);
    });
    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        voiceSearch({
          container,
          templates: {
            buttonText({ isListening }) {
              return <span>{isListening ? 'Stop' : 'Start'}</span>;
            },
            status({ isListening, status }) {
              return (
                <div className={isListening ? 'LISTENING' : 'NOT-LISTENING'}>
                  <span>{status}</span>
                </div>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-VoiceSearch"
  >
    <button
      class="ais-VoiceSearch-button"
      disabled=""
      title="Search by voice (not supported on this browser)"
      type="button"
    >
      <span>
        Start
      </span>
    </button>
    <div
      class="ais-VoiceSearch-status"
    >
      <div
        class="NOT-LISTENING"
      >
        <span>
          initial
        </span>
      </div>
    </div>
  </div>
</div>
`);
    });
  });
});
