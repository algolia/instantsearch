import { mount } from '@vue/test-utils';
import RefinementList from '../RefinementList.vue';
import { __setState } from '../../mixins/component';
jest.mock('../../mixins/component');
jest.mock('../../mixins/panel');

const defaultState = {
  items: [
    {
      value: 'yo',
      label: 'yo',
      highlighted: 'y<em>o</em>',
      isRefined: false,
      count: 20,
    },
    {
      value: 'how',
      label: 'how',
      highlighted: 'how',
      isRefined: false,
      count: 10,
    },
    {
      value: 'are',
      label: 'are',
      highlighted: 'are',
      isRefined: false,
      count: 8,
    },
    {
      value: 'you',
      label: 'you',
      highlighted: 'you',
      isRefined: false,
      count: 9,
    },
    {
      value: 'doing',
      label: 'doing',
      highlighted: 'doing',
      isRefined: false,
      count: 100,
    },
    { value: '?', label: '?', highlighted: '?', isRefined: false, count: 0 },
  ],
};

it('renders correctly', () => {
  __setState({
    ...defaultState,
  });
  const wrapper = mount(RefinementList, {
    propsData: {
      attribute: 'something',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (empty)', () => {
  __setState({
    items: [],
  });
  const wrapper = mount(RefinementList, {
    propsData: {
      attribute: 'something',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it("renders correctly when it's searchable", () => {
  __setState({
    ...defaultState,
    searchable: true,
  });
  const wrapper = mount(RefinementList, {
    propsData: {
      attribute: 'something',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it("disables show more if can't refine", () => {
  __setState({
    ...defaultState,
    canToggleShowMore: false,
  });
  const wrapper = mount(RefinementList, {
    propsData: {
      attribute: 'something',
      showMore: true,
    },
  });

  const showMore = wrapper.find('.ais-RefinementList-showMore');

  expect(showMore.attributes().disabled).toBe('disabled');
  expect(showMore.classes()).toContain('ais-RefinementList-showMore--disabled');

  wrapper.setData({ state: { canToggleShowMore: true } });
  expect(showMore.attributes().disabled).toBeUndefined();
  expect(showMore.classes()).not.toContain(
    'ais-RefinementList-showMore--disabled'
  );
});

it('behaves correctly', () => {
  __setState({
    ...defaultState,
    refine: jest.fn(),
  });
  const wrapper = mount(RefinementList, {
    propsData: {
      attribute: 'something',
    },
  });
  const button = wrapper.find('input[type="checkbox"]');
  button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith('yo');
});
