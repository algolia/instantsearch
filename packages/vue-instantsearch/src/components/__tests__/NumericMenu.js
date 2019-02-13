import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import NumericMenu from '../NumericMenu.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const all = {
  label: 'All',
};

const lessThan10 = {
  label: '<= 10$',
  // Follow the InstantSearch implementation
  value: encodeURI(JSON.stringify({ end: 10 })),
  isRefined: false,
};

const from10to100 = {
  label: '10$ - 100$',
  // Follow the InstantSearch implementation
  value: encodeURI(JSON.stringify({ start: 10, end: 100 })),
  isRefined: false,
};

const from100to500 = {
  label: '100$ - 500$',
  // Follow the InstantSearch implementation
  value: encodeURI(JSON.stringify({ start: 100, end: 500 })),
  isRefined: false,
};

const moreThan500 = {
  label: '>= 500$',
  // Follow the InstantSearch implementation
  value: encodeURI(JSON.stringify({ start: 500 })),
  isRefined: false,
};

const defaultState = {
  items: [all, lessThan10, from10to100, from100to500, moreThan500],
  hasNoResults: false,
  createURL: () => {},
  refine: () => {},
};

const defaultProps = {
  attribute: 'brand',
  items: [
    { label: 'All' },
    { label: '<= 10$', end: 10 },
    { label: '10$ - 100$', start: 10, end: 100 },
    { label: '100$ - 500$', start: 100, end: 500 },
    { label: '>= 500$', start: 500 },
  ],
};

it('accepts an attribute prop', () => {
  __setState(defaultState);

  const props = {
    ...defaultProps,
  };

  const wrapper = mount(NumericMenu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.attribute).toBe('brand');
});

it('accepts an items prop', () => {
  __setState(defaultState);

  const props = {
    ...defaultProps,
  };

  const wrapper = mount(NumericMenu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.items).toEqual([
    { label: 'All' },
    { label: '<= 10$', end: 10 },
    { label: '10$ - 100$', start: 10, end: 100 },
    { label: '100$ - 500$', start: 100, end: 500 },
    { label: '>= 500$', start: 500 },
  ]);
});

it('accepts an transformItems prop', () => {
  __setState(defaultState);

  const identity = x => x;

  const props = {
    ...defaultProps,
    transformItems: identity,
  };

  const wrapper = mount(NumericMenu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(identity);
});

describe('default render', () => {
  it('renders correctly', () => {
    __setState(defaultState);

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      hasNoResults: true,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a selected value', () => {
    __setState({
      ...defaultState,
      items: [
        all,
        lessThan10,
        { ...from10to100, isRefined: true },
        from100to500,
        moreThan500,
      ],
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on radio change', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
    });

    const input = wrapper.findAll('.ais-NumericMenu-radio').at(3);

    input.trigger('change');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('100'));
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('500'));
  });

  it('calls the Panel mixin with `hasNoResults`', () => {
    __setState({ ...defaultState });

    const wrapper = mount(NumericMenu, {
      propsData: defaultProps,
    });

    const mapStateToCanRefine = () =>
      wrapper.vm.mapStateToCanRefine(wrapper.vm.state);

    expect(mapStateToCanRefine()).toBe(true);

    wrapper.setData({
      state: {
        hasNoResults: true,
      },
    });

    expect(mapStateToCanRefine()).toBe(false);
  });
});

describe('custom default render', () => {
  const defaultScopedSlot = `
    <ul
      slot-scope="{ items, canRefine, refine, createURL }"
      :class="[!canRefine && 'no-refinement']"
    >
      <li
        v-for="item in items"
        :key="item.label"
        :class="[item.isRefined && 'selected']"
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
    __setState(defaultState);

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      hasNoResults: true,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a selected value', () => {
    __setState({
      ...defaultState,
      items: [
        all,
        lessThan10,
        { ...from10to100, isRefined: true },
        from100to500,
        moreThan500,
      ],
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: (value = 'all') => `/price/${value}`,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
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

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(NumericMenu, {
      propsData: props,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    const link = wrapper.findAll('a').at(3);

    link.trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('100'));
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('500'));
  });
});
