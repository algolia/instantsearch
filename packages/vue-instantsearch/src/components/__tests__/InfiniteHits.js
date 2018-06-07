import { mount } from '@vue/test-utils';
import { __setState } from '../../component';
import InfiniteHits from '../InfiniteHits.vue';

jest.mock('../../component');

const defaultState = {
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
  isLastPage: false,
  showMore: () => {},
};

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

it('renders correctly on the last page', () => {
  __setState({
    ...defaultState,
    isLastPage: true,
  });

  const wrapper = mount(InfiniteHits);

  expect(wrapper.html()).toMatchSnapshot();
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
