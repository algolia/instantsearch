import { mount } from '@vue/test-utils';
import SortBy from '../SortBy.vue';
import { __setState } from '../../component';

jest.mock('../../component');

const defaultState = {
  options: [
    { value: 'some_index', label: 'Relevance' },
    { value: 'some_index_cool', label: 'Coolness ascending' },
    { value: 'some_index_quality', label: 'Quality ascending' },
  ],
  hasNoResults: false,
  currentRefinement: 'some_index',
};

const defaultProps = {
  items: [
    { value: 'some_index', label: 'Relevance' },
    { value: 'some_index_cool', label: 'Coolness ascending' },
    { value: 'some_index_quality', label: 'Quality ascending' },
  ],
};

it('renders correctly', () => {
  __setState({ ...defaultState });

  const wrapper = mount(SortBy, {
    propsData: {
      ...defaultProps,
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders with scoped slots', () => {
  const defaultSlot = `
  <select
    slot-scope="{ items, refine, currentRefinement }"
    @change="refine($event.currentTarget.value)"
  >
    <option
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :selected="item.value === currentRefinement"
    >
      {{item.label}}
    </option>
  </select>
`;

  __setState({
    ...defaultState,
  });

  const wrapper = mount(SortBy, {
    propsData: {
      ...defaultProps,
    },
    scopedSlots: {
      default: defaultSlot,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('calls `refine` when the selection changes with the `value`', () => {
  const refine = jest.fn();
  __setState({
    ...defaultState,
    refine,
  });
  const wrapper = mount(SortBy, {
    propsData: {
      ...defaultProps,
    },
  });
  // This is bad 👇🏽 but the only way for now to trigger changes
  // on a select: https://github.com/vuejs/vue-test-utils/issues/260
  const select = wrapper.find('select');
  select.element.value = 'some_index_quality';
  select.trigger('change');
  const selectedOption = wrapper.find('option[value=some_index_quality]');

  expect(refine).toHaveBeenCalledTimes(1);
  expect(refine).toHaveBeenLastCalledWith('some_index_quality');
  expect(selectedOption.element.selected).toBe(true);
});
