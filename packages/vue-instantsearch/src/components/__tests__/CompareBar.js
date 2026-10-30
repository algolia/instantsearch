/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import userEvent from '@testing-library/user-event';

import { mount, nextTick } from '../../../test/utils';
import CompareBar from '../CompareBar';
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

async function mountCompareBar() {
  wrapper = mount(
    {
      components: { InstantSearch, CompareBar },
      data() {
        return { searchClient: createSearchClient() };
      },
      template: `
        <InstantSearch :search-client="searchClient" index-name="indexName">
          <CompareBar ref="bar" configuration-id="algolia_comparison_abc" />
        </InstantSearch>
      `,
    },
    // Focus is a no-op on detached nodes.
    { attachTo: document.body }
  );

  await flush();

  return wrapper.vm.$refs.bar;
}

// In Vue 3, a selection change reaches the bar through InstantSearch's
// deferred render, then Vue patches the DOM on its own tick.
async function flush() {
  await wait(0);
  await nextTick();
}

function getRemoveButton(name) {
  return document.querySelector(
    `[aria-label="Remove ${name} from comparison"]`
  );
}

describe('CompareBar', () => {
  test('keeps focus in the bar after removing an item', async () => {
    const bar = await mountCompareBar();

    bar.state.toggleItem({ objectID: 'A', name: 'A' });
    bar.state.toggleItem({ objectID: 'B', name: 'B' });
    bar.state.toggleItem({ objectID: 'C', name: 'C' });
    await flush();

    userEvent.click(getRemoveButton('A'));
    await flush();

    expect(getRemoveButton('A')).toBeNull();
    expect(getRemoveButton('B')).toHaveFocus();

    userEvent.click(getRemoveButton('C'));
    await flush();

    expect(getRemoveButton('C')).toBeNull();
    expect(getRemoveButton('B')).toHaveFocus();
  });
});
