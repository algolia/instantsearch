import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import InfiniteHits from '../InfiniteHits.vue';

jest.mock('../../mixins/widget');

const defaultState = {
  widgetParams: {
    showPrevious: false,
    escapeHTML: true,
    transformItems: items => items,
  },
  hits: [
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

it('accepts a escapeHTML prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(InfiniteHits, {
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

  const wrapper = mount(InfiniteHits, {
    propsData: {
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

it('accepts a showPrevious prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(InfiniteHits, {
    propsData: {
      showPrevious: true,
    },
  });

  expect(wrapper.vm.widgetParams.showPrevious).toBe(true);
});

it('renders correctly', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(InfiniteHits);

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly with a custom rendering', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(InfiniteHits, {
    scopedSlots: {
      default: `
        <div slot-scope="{ items }">
          <div v-for="item in items">
            {{item.objectID}}
          </div>
        </div>
      `,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly with a custom item rendering', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(InfiniteHits, {
    scopedSlots: {
      item: `
        <div slot-scope="{ item }">
          {{item.objectID}}
        </div>
      `,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly on the first page', () => {
  __setState({
    ...defaultState,
    isFirstPage: true,
  });

  const wrapper = mount(InfiniteHits, {
    propsData: {
      showPrevious: true,
    },
  });

  const previousButton = wrapper.find('.ais-InfiniteHits-loadPrevious');

  expect(previousButton.exists()).toEqual(true);
  expect(
    previousButton.classes('ais-InfiniteHits-loadPrevious--disabled')
  ).toEqual(true);
  expect(previousButton.attributes('disabled')).toEqual('disabled');
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly on the last page', () => {
  __setState({
    ...defaultState,
    isLastPage: true,
  });

  const wrapper = mount(InfiniteHits);

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly when not on the first page', () => {
  __setState({
    ...defaultState,
    isFirstPage: false,
    isLastPage: false,
  });

  const wrapper = mount(InfiniteHits, {
    propsData: {
      showPrevious: true,
    },
  });

  const previousButton = wrapper.find('.ais-InfiniteHits-loadPrevious');

  expect(previousButton.exists()).toEqual(true);
  expect(
    previousButton.classes('ais-InfiniteHits-loadPrevious--disabled')
  ).toEqual(false);
  expect(previousButton.attributes('disabled')).toEqual(undefined);
  expect(wrapper.html()).toMatchSnapshot();
});

it('expect to call showPrevious on click', () => {
  const showPrevious = jest.fn();

  __setState({
    ...defaultState,
    showPrevious,
  });

  const wrapper = mount(InfiniteHits, {
    propsData: {
      showPrevious: true,
    },
  });

  expect(showPrevious).toHaveBeenCalledTimes(0);

  wrapper.find('.ais-InfiniteHits-loadPrevious').trigger('click');

  expect(showPrevious).toHaveBeenCalledTimes(1);
});

it('expect to call showMore on click', () => {
  const showMore = jest.fn();

  __setState({
    ...defaultState,
    showMore,
  });

  const wrapper = mount(InfiniteHits);

  expect(showMore).not.toHaveBeenCalled();

  wrapper.find('.ais-InfiniteHits-loadMore').trigger('click');

  expect(showMore).toHaveBeenCalled();
});

it('exposes insights prop to the default slot', () => {
  const insights = jest.fn();

  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount(InfiniteHits, {
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
  wrapper.find('#add-to-cart-00002').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['00002'],
  });
});

it('exposes insights prop to the item slot', () => {
  const insights = jest.fn();

  __setState({
    ...defaultState,
    insights,
  });

  const wrapper = mount(InfiniteHits, {
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
  wrapper.find('#add-to-cart-00002').trigger('click');
  expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
    eventName: 'Add to cart',
    objectIDs: ['00002'],
  });
});
