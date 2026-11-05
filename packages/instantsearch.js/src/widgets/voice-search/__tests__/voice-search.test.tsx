/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import voiceSearch from '../voice-search';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('voiceSearch', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([voiceSearch({ container })]);

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
              <svg
                fill="none"
                height="16"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <path
                  d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                  fill="none"
                />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2"
                />
                <line
                  x1="12"
                  x2="12"
                  y1="19"
                  y2="23"
                />
                <line
                  x1="8"
                  x2="16"
                  y1="23"
                  y2="23"
                />
              </svg>
            </button>
            <div
              class="ais-VoiceSearch-status"
            >
              <p>
                
              </p>
            </div>
          </div>
        </div>
      `);
    });

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
