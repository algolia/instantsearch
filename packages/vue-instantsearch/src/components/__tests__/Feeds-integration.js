/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

jest.unmock('instantsearch.js/es');

import { createCompositionClient } from '@instantsearch/mocks';

import { mount, nextTick } from '../../../test/utils';
import Feeds from '../Feeds';
import InstantSearch from '../InstantSearch';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('AisFeeds (integration)', () => {
  it('registers feed containers and scopes slot descendants', async () => {
    const wrapper = mount({
      data() {
        return {
          searchClient: createCompositionClient({}),
          indexName: 'indexName',
          compositionID: 'my-composition',
        };
      },
      template: `
        <InstantSearch
          v-bind="{ searchClient, indexName, compositionID }"
        >
          <Feeds search-scope="global" v-slot="{ feedID }">
            <ScopedFeed :feedid="feedID || 'default'" />
          </Feeds>
        </InstantSearch>
      `,
      components: {
        Feeds,
        InstantSearch,
        ScopedFeed: {
          name: 'ScopedFeed',
          inject: ['$_ais_getParentIndex'],
          props: {
            feedid: {
              type: String,
              required: true,
            },
          },
          template: `<div class="scoped-feed">{{ feedid }}:{{ $_ais_getParentIndex().getIndexId() }}</div>`,
        },
      },
    });

    await wait(20);
    await nextTick();

    expect(wrapper.findAll('.scoped-feed')).toHaveLength(1);
    expect(wrapper.find('.scoped-feed').text()).toBe('default:');

    const widgets = wrapper
      .findComponent(InstantSearch)
      .vm.instantSearchInstance.mainIndex.getWidgets();
    expect(widgets.some(widget => widget.$$type === 'ais.feeds')).toBe(true);
    expect(widgets.some(widget => widget.$$type === 'ais.feedContainer')).toBe(
      true
    );
  });
});
