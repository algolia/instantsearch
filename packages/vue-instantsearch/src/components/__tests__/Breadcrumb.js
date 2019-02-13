import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import Breadcrumb from '../Breadcrumb.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultItems = [
  {
    label: 'TV & Home Theater',
    value: 'TV & Home Theater',
  },
  {
    label: 'Streaming Media Players',
    value: 'TV & Home Theater > Streaming Media Players',
  },
];

const defaultState = {
  items: defaultItems,
  canRefine: true,
  refine: () => {},
  createURL: () => {},
};

const defaultProps = {
  attributes: ['categories.lvl0', 'categories.lvl1'],
};

it('accepts an attribute prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Breadcrumb, {
    propsData: defaultProps,
  });

  expect(wrapper.vm.widgetParams.attributes).toEqual([
    'categories.lvl0',
    'categories.lvl1',
  ]);
});

it('accepts a separator prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Breadcrumb, {
    propsData: {
      ...defaultProps,
      separator: ' ~ ',
    },
  });

  expect(wrapper.vm.widgetParams.separator).toBe(' ~ ');
});

it('accepts a rootPath prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(Breadcrumb, {
    propsData: {
      ...defaultProps,
      rootPath: 'TV & Home Theater',
    },
  });

  expect(wrapper.vm.widgetParams.rootPath).toBe('TV & Home Theater');
});

it('accepts a transformItems prop', () => {
  __setState({
    ...defaultState,
  });

  const transformItems = () => {};

  const wrapper = mount(Breadcrumb, {
    propsData: {
      ...defaultProps,
      transformItems,
    },
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

describe('default render', () => {
  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    const selected = wrapper.find('.ais-Breadcrumb-item--selected');

    expect(selected.text()).toContain('Home');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a selected item', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    const selected = wrapper.find('.ais-Breadcrumb-item--selected');

    expect(selected.text()).toContain('Streaming Media Players');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: value => `/${value}`,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on root click', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    wrapper
      .findAll('a')
      .at(0)
      .trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith();
  });

  it('calls refine on item click', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    wrapper
      .findAll('a')
      .at(1)
      .trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('TV & Home Theater');
  });

  it('calls the Panel mixin with `canRefine`', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    const mapStateToCanRefine = () =>
      wrapper.vm.mapStateToCanRefine(wrapper.vm.state);

    expect(mapStateToCanRefine()).toBe(true);

    wrapper.setData({
      state: {
        canRefine: false,
      },
    });

    expect(mapStateToCanRefine()).toBe(false);
  });
});

describe('custom default render', () => {
  const defaultScopedSlot = `
    <ul
      slot-scope="{ items, canRefine, refine, createURL }"
      :class="[!canRefine && 'noRefinement']"
    >
      <li
        v-for="(item, index) in items"
        :key="item.label"
      >
        <a
          :href="createURL(item.value)"
          @click.prevent="refine(item.value)"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: value => `/${value}`,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on link click', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    wrapper
      .findAll('a')
      .at(0)
      .trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('TV & Home Theater');
  });
});

describe('custom rootLabel render', () => {
  const roolLabelSlot = `
    <template>Home page</template>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        rootLabel: roolLabelSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        rootLabel: roolLabelSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

describe('custom separator render', () => {
  const separatorSlot = `
    <template>~~</template>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
      scopedSlots: {
        separator: separatorSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
