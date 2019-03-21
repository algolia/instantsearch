import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import Toggle from '../ToggleRefinement.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultValue = {
  name: 'free_shipping',
  count: 100,
  isRefined: false,
};

const defaultState = {
  value: defaultValue,
  refine: () => {},
  createURL: () => {},
};

const defaultProps = {
  attribute: 'free_shipping',
  label: 'Free Shipping',
};

it('accepts an attribute prop', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Toggle, {
    propsData: defaultProps,
  });

  expect(wrapper.vm.widgetParams.attribute).toBe('free_shipping');
});

it('accepts a label prop', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Toggle, {
    propsData: defaultProps,
  });

  expect(wrapper.vm.widgetParams.label).toBe('Free Shipping');
});

it('accepts an on prop', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Toggle, {
    propsData: {
      ...defaultProps,
      on: 'somevalue',
    },
  });

  expect(wrapper.vm.widgetParams.on).toBe('somevalue');
});

it('accepts an off prop', () => {
  __setState({ ...defaultState });

  const wrapper = mount(Toggle, {
    propsData: {
      ...defaultProps,
      off: false,
    },
  });

  expect(wrapper.vm.widgetParams.off).toBe(false);
});

describe('default render', () => {
  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement (with 0)', () => {
    __setState({
      ...defaultState,
      value: {
        ...defaultValue,
        count: 0,
      },
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement (with null)', () => {
    __setState({
      ...defaultState,
      value: {
        ...defaultValue,
        count: null,
      },
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with the value not selected', () => {
    __setState({
      ...defaultState,
      value: {
        ...defaultValue,
        isRefined: false,
      },
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    expect(wrapper.find('input').element.checked).toBe(false);
  });

  it('renders correctly with the value selected', () => {
    __setState({
      ...defaultState,
      value: {
        ...defaultValue,
        isRefined: true,
      },
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    expect(wrapper.find('input').element.checked).toBe(true);
  });

  it('calls refine on input change', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    wrapper.find('input').setChecked(true);

    expect(refine).toHaveBeenCalled();
    expect(refine).toHaveBeenCalledWith(defaultValue);
  });

  it('calls the Panel mixin with `value.count`', () => {
    __setState({
      ...defaultState,
      value: {
        // Otherwise setData update the default value
        // and impact the other tests. We should not
        // rely on a global state for the tests.
        ...defaultValue,
      },
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
    });

    const mapStateToCanRefine = () =>
      wrapper.vm.mapStateToCanRefine(wrapper.vm.state);

    expect(mapStateToCanRefine()).toBe(true);

    wrapper.setData({
      state: {
        value: {
          count: 0,
        },
      },
    });

    expect(mapStateToCanRefine()).toBe(false);
  });
});

describe('custom default render', () => {
  const defaultScopedSlot = `
    <a
      slot-scope="{ value, canRefine, refine, createURL }"
      :href="createURL()"
      :class="[!canRefine && 'noRefinement']"
      @click.prevent="refine(value)"
    >
      <span>{{ value.name }}</span>
      <span>{{ value.isRefined ? '(is enabled)' : '(is disabled)' }}</span>
    </a>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Toggle, {
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
      value: {
        ...defaultValue,
        count: 0,
      },
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: () => `/free-shipping`,
    });

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with the value selected', () => {
    __setState({
      ...defaultState,
      value: {
        ...defaultValue,
        isRefined: true,
      },
    });

    const wrapper = mount(Toggle, {
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

    const wrapper = mount(Toggle, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    wrapper.find('a').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(defaultValue);
  });
});
