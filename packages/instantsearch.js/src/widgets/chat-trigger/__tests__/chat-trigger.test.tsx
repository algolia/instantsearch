/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import instantsearch from '../../../index.es';
import chatTrigger from '../chat-trigger';

function getButtonLabel(container: HTMLElement) {
  return container
    .querySelector('.ais-ChatToggleButton')!
    .getAttribute('aria-label');
}

async function renderTrigger(
  params: Partial<Parameters<typeof chatTrigger>[0]> = {}
) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const search = instantsearch({
    indexName: 'indexName',
    searchClient: createSearchClient(),
  });
  search.addWidgets([chatTrigger({ container, ...params })]);
  search.start();
  await wait(0);

  return container;
}

describe('chatTrigger translations', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('names the button "Open chat" by default', async () => {
    const container = await renderTrigger();

    expect(getButtonLabel(container)).toBe('Open chat');
  });

  test('uses custom translations for the button name', async () => {
    const container = await renderTrigger({
      translations: { openLabel: 'Ouvrir le chat' },
    });

    expect(getButtonLabel(container)).toBe('Ouvrir le chat');
  });
});
