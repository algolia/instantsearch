/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

import { mount, nextTick } from '../../../test/utils';
import ChatTrigger from '../ChatTrigger';
import InstantSearch from '../InstantSearch';

jest.unmock('instantsearch.js/es');

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.destroy();
    wrapper = undefined;
  }
  document.body.innerHTML = '';
});

async function mountTrigger(triggerProps = {}) {
  wrapper = mount(
    {
      components: { InstantSearch, ChatTrigger },
      data() {
        return {
          searchClient: createSearchClient(),
          triggerProps,
        };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <ChatTrigger v-bind="triggerProps" />
        </InstantSearch>
      `,
    },
    { attachTo: document.body }
  );

  await nextTick();
  await nextTick();

  return wrapper.find('.ais-ChatToggleButton');
}

describe('ChatTrigger translations', () => {
  test('names the button "Open chat" by default', async () => {
    const button = await mountTrigger();

    expect(button.attributes('aria-label')).toBe('Open chat');
  });

  test('uses custom translations for the button name', async () => {
    const button = await mountTrigger({
      translations: { openLabel: 'Ouvrir le chat' },
    });

    expect(button.attributes('aria-label')).toBe('Ouvrir le chat');
  });
});
