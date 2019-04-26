import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import Hits from '../Hits.vue';

jest.mock('../../mixins/widget');

const defaultState = {
  hits: [{ objectID: 'one' }, { objectID: 'two' }],
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

it('exposes insights prop to the default slot', () => {
  const insights = jest.fn();
  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount(Hits, {
    scopedSlots: {
      default: `
        <ul slot-scope="{ items, insights }">
          <li v-for="(item, itemIndex) in items" >
          
            <button :id="'add-to-cart-' + item.objectID" @click="insights('clickedObjectIDsAfterSearch', {eventName: 'Add to cart', objectIDs: [item.objectID]})">
              Add to cart
            </button>
          </li>
        </ul>
      `,
    },
  });
  wrapper.find('#add-to-cart-two').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['two'],
  });
});

it('exposes insights prop to the item slot', () => {
  const insights = jest.fn();
  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount(Hits, {
    scopedSlots: {
      item: `
        <div slot-scope="{ item, insights }">
          <button :id="'add-to-cart-' + item.objectID" @click="insights('clickedObjectIDsAfterSearch', {eventName: 'Add to cart', objectIDs: [item.objectID]})">
            Add to cart
          </button>
        </div>
      `,
    },
  });
  wrapper.find('#add-to-cart-two').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['two'],
  });
});
