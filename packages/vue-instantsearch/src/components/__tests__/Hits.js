/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Hits from '../Hits';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');

const defaultState = {
  items: [{ objectID: 'one' }, { objectID: 'two' }],
  sendEvent: jest.fn(),
};

it('accepts a showBanner prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Hits, {
    propsData: {
      showBanner: true,
    },
  });

  expect(wrapper.vm.widgetParams.showBanner).toBe(true);
});

it('accepts an escapeHTML prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Hits, {
    propsData: {
      escapeHTML: true,
    },
  });

  expect(wrapper.vm.widgetParams.escapeHTML).toBe(true);
});

it('exposes banner prop to the banner slot', () => {
  __setState({
    ...defaultState,
    banner: {
      image: {
        urls: [{ url: 'https://via.placeholder.com/550x250' }],
      },
    },
  });

  const wrapper = mount(
    {
      components: { Hits },
      template: `
      <Hits>
        <template v-slot:banner="{ banner }">
          <img :src=banner.image.urls[0].url />
        </template>
      </Hits>
    `,
    },
    {
      propsData: {
        showBanner: true,
      },
    }
  );
  const img = wrapper.find('img');
  expect(img.attributes('src')).toBe('https://via.placeholder.com/550x250');
});

it('exposes insights prop to the default slot', async () => {
  const insights = jest.fn();
  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount({
    components: { Hits },
    template: `
      <Hits>
        <template v-slot="{ items, insights }">
          <ul>
            <li v-for="(item, itemIndex) in items" >

              <button :id="'add-to-cart-' + item.objectID" @click="insights('clickedObjectIDsAfterSearch', {eventName: 'Add to cart', objectIDs: [item.objectID]})">
                Add to cart
              </button>
            </li>
          </ul>
        </template>
      </Hits>
    `,
  });
  await wrapper.find('#add-to-cart-two').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['two'],
  });
});

it('exposes insights prop to the item slot', async () => {
  const insights = jest.fn();
  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount({
    components: { Hits },
    template: `
      <Hits>
        <template v-slot:item="{ item, insights }">
          <div>
            <button :id="'add-to-cart-' + item.objectID" @click="insights('clickedObjectIDsAfterSearch', {eventName: 'Add to cart', objectIDs: [item.objectID]})">
              Add to cart
            </button>
          </div>
        </template>
      </Hits>
    `,
  });
  await wrapper.find('#add-to-cart-two').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['two'],
  });
});

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { Hits },
    template: `
      <Hits>
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </Hits>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});
