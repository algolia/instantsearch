/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Hits from '../Hits.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');

const defaultState = {
  hits: [{ objectID: 'one' }, { objectID: 'two' }],
  sendEvent: jest.fn(),
};

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

it('accepts a transformItems prop', () => {
  __setState({
    ...defaultState,
  });

  const transformItems = () => {};

  const wrapper = mount(Hits, {
    propsData: {
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

it('renders correctly', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Hits);

  expect(wrapper.html()).toMatchSnapshot();
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
