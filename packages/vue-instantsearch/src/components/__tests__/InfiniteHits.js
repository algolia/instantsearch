/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import InfiniteHits from '../InfiniteHits.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');

const defaultState = {
  widgetParams: {
    showBanner: true,
    showPrevious: false,
    escapeHTML: true,
    transformItems: (items) => items,
  },
  sendEvent: jest.fn(),
  items: [
    {
      objectID: '00001',
    },
    {
      objectID: '00002',
    },
    {
      objectID: '00003',
    },
    {
      objectID: '00004',
    },
    {
      objectID: '00005',
    },
  ],
  results: {
    page: 0,
  },
  isFirstPage: false,
  isLastPage: false,
  showMore: () => {},
  showPrevious: () => {},
};

it('renders correctly with a custom rendering', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `
      <InfiniteHits>
        <template v-slot="{ items }">
          <div>
            <div v-for="item in items">
              {{item.objectID}}
            </div>
          </div>
        </template>
      </InfiniteHits>
    `,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly with a custom item rendering', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `
      <InfiniteHits>
        <template v-slot:item="{ item }">
          <div>
            {{item.objectID}}
          </div>
        </template>
      </InfiniteHits>
    `,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly with banner data', () => {
  __setState({
    ...defaultState,
    banner: {
      image: {
        urls: [{ url: 'https://via.placeholder.com/550x250' }],
      },
      link: {
        url: 'https://www.algolia.com',
      },
    },
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `<InfiniteHits />`,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly with banner data and custom banner rendering', () => {
  __setState({
    ...defaultState,
    banner: {
      image: {
        urls: [{ url: 'https://via.placeholder.com/550x250' }],
      },
      link: {
        url: 'https://www.algolia.com',
      },
    },
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `
      <InfiniteHits>
        <template v-slot:banner="{ banner }">
          <img :src="banner.image.urls[0].url" />
        </template>
      </InfiniteHits>
    `,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('does not render a banner when showBanner is false', () => {
  __setState({
    ...defaultState,
    banner: {
      image: {
        urls: [{ url: 'https://via.placeholder.com/550x250' }],
      },
      link: {
        url: 'https://www.algolia.com',
      },
    },
    widgetParams: {
      ...defaultState.widgetParams,
      showBanner: false,
    },
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `<InfiniteHits />`,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('exposes insights prop to the default slot', async () => {
  const insights = jest.fn();

  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `
      <InfiniteHits>
        <template v-slot="{ items, insights }">
        <ul>
        <li v-for="(item, itemIndex) in items" >
          <button :id="'add-to-cart-' + item.objectID" @click="insights('clickedObjectIDsAfterSearch', {eventName: 'Add to cart', objectIDs: [item.objectID]})">
            Add to cart
          </button>
        </li>
      </ul>
        </template>
      </InfiniteHits>
    `,
  });

  await wrapper.find('#add-to-cart-00002').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['00002'],
  });
});

it('exposes insights prop to the item slot', async () => {
  const insights = jest.fn();

  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `
      <InfiniteHits>
        <template v-slot:item="{ item, insights }">
          <div>
            <button :id="'add-to-cart-' + item.objectID" @click="insights('clickedObjectIDsAfterSearch', {eventName: 'Add to cart', objectIDs: [item.objectID]})">
              Add to cart
            </button>
          </div>
        </template>
      </InfiniteHits>
    `,
  });

  await wrapper.find('#add-to-cart-00002').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['00002'],
  });
});

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { InfiniteHits },
    template: `
      <InfiniteHits>
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </InfiniteHits>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});
