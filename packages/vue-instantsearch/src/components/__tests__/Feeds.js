/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount, nextTick } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Feeds from '../Feeds';

jest.mock('../../mixins/widget');
jest.mock('instantsearch.js/es/connectors/feeds/FeedContainer', () => ({
  createFeedContainer: jest.fn(feedID => ({ __feedID: feedID })),
}));

describe('AisFeeds', () => {
  beforeEach(() => {
    __setState(null);
  });

  it('passes arguments to connector', () => {
    const transformFeeds = feeds => feeds;
    const wrapper = mount(Feeds, {
      propsData: {
        searchScope: 'global',
        transformFeeds,
      },
    });

    expect(wrapper.vm.widgetParams).toEqual({
      searchScope: 'global',
      transformFeeds,
    });
  });

  it('renders slot content in feed order and updates when order changes', async () => {
    const parentIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
    };

    const wrapper = mount({
      components: { Feeds },
      template: `
        <Feeds search-scope="global" v-slot="{ feedID }">
          <div class="slot-feed">{{ feedID }}</div>
        </Feeds>
      `,
    });

    const feedsComponent = wrapper.findComponent(Feeds).vm;
    feedsComponent.getParentIndex = () => parentIndex;
    feedsComponent.state = { feedIDs: ['products', 'articles'] };
    await nextTick();

    const feeds = wrapper.findAll('.slot-feed');
    expect(feeds).toHaveLength(2);
    expect(feeds.at(0).text()).toBe('products');
    expect(feeds.at(1).text()).toBe('articles');

    feedsComponent.state = { feedIDs: ['articles', 'products'] };
    await nextTick();

    const reordered = wrapper.findAll('.slot-feed');
    expect(reordered).toHaveLength(2);
    expect(reordered.at(0).text()).toBe('articles');
    expect(reordered.at(1).text()).toBe('products');
  });

  it('removes disappeared feeds with deferred parent cleanup', async () => {
    jest.useFakeTimers();
    const parentIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
    };

    const wrapper = mount({
      components: { Feeds },
      template: `
        <Feeds search-scope="global" v-slot="{ feedID }">
          <div class="slot-feed">{{ feedID }}</div>
        </Feeds>
      `,
    });

    const feedsComponent = wrapper.findComponent(Feeds).vm;
    feedsComponent.getParentIndex = () => parentIndex;
    feedsComponent._pendingRemovals = [];
    feedsComponent._removalTimer = null;
    feedsComponent.state = { feedIDs: ['products', 'articles'] };
    await nextTick();

    feedsComponent.state = { feedIDs: ['products'] };
    await nextTick();

    expect(wrapper.findAll('.slot-feed')).toHaveLength(1);
    expect(wrapper.find('.slot-feed').text()).toBe('products');
    expect(parentIndex.removeWidgets).not.toHaveBeenCalled();

    jest.runAllTimers();
    await nextTick();
    expect(parentIndex.removeWidgets).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('scopes slot descendants to the matching feed container', async () => {
    const parentIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
    };

    const ScopedFeed = {
      name: 'ScopedFeed',
      inject: ['$_ais_getParentIndex'],
      props: {
        feedid: {
          type: String,
          required: true,
        },
      },
      template: `<div class="scoped-feed">{{ feedid }}:{{ $_ais_getParentIndex().__feedID }}</div>`,
    };

    const wrapper = mount({
      components: { Feeds, ScopedFeed },
      template: `
        <Feeds search-scope="global" v-slot="{ feedID }">
          <ScopedFeed :feedid="feedID" />
        </Feeds>
      `,
    });

    const feedsComponent = wrapper.findComponent(Feeds).vm;
    feedsComponent.getParentIndex = () => parentIndex;
    feedsComponent.state = { feedIDs: ['products', 'articles'] };
    await nextTick();

    const scoped = wrapper.findAll('.scoped-feed');
    expect(scoped).toHaveLength(2);
    expect(scoped.at(0).text()).toBe('products:products');
    expect(scoped.at(1).text()).toBe('articles:articles');
  });

  it('mounts containers for all feedIDs even with empty slot content', async () => {
    const parentIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
    };

    const wrapper = mount({
      components: { Feeds },
      template: `
        <Feeds search-scope="global" v-slot="{ feedID }">
          <div v-if="feedID === 'products'" class="slot-feed">{{ feedID }}</div>
        </Feeds>
      `,
    });

    const feedsComponent = wrapper.findComponent(Feeds).vm;
    feedsComponent.getParentIndex = () => parentIndex;
    feedsComponent.state = { feedIDs: ['products', 'articles'] };
    await nextTick();

    expect(wrapper.findAll('.slot-feed')).toHaveLength(1);
    expect(wrapper.find('.slot-feed').text()).toBe('products');
    expect(parentIndex.addWidgets).toHaveBeenCalledTimes(1);
    expect(parentIndex.addWidgets.mock.calls[0][0]).toHaveLength(2);
    expect(parentIndex.addWidgets.mock.calls[0][0][0].__feedID).toBe(
      'products'
    );
    expect(parentIndex.addWidgets.mock.calls[0][0][1].__feedID).toBe(
      'articles'
    );
  });
});
