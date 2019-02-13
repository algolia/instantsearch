import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import Menu from '../Menu.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const apple = {
  value: 'Apple',
  label: 'Apple',
  count: 50,
  isRefined: false,
};

const samsung = {
  value: 'Samsung',
  label: 'Samsung',
  count: 25,
  isRefined: false,
};

const microsoft = {
  value: 'Microsoft',
  label: 'Microsoft',
  count: 12,
  isRefined: false,
};

const defaultState = {
  items: [apple, samsung, microsoft],
  canRefine: true,
  canToggleShowMore: false,
  isShowingMore: false,
  refine: () => {},
  createURL: () => {},
  toggleShowMore: () => {},
};

const defaultProps = {
  attribute: 'brand',
};

it('accepts an attribute prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
  };

  const wrapper = mount(Menu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.attribute).toBe('brand');
});

it('accepts a limit prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
    limit: 5,
  };

  const wrapper = mount(Menu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.limit).toBe(5);
});

it('accepts a showMoreLimit prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
    showMoreLimit: 10,
  };

  const wrapper = mount(Menu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.showMoreLimit).toBe(10);
});

it('accepts a sortBy prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
    sortBy: ['name:desc'],
  };

  const wrapper = mount(Menu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.sortBy).toEqual(['name:desc']);
});

it('accepts a transformItems prop', () => {
  __setState({
    ...defaultState,
  });

  const transformItems = () => {};

  const props = {
    ...defaultProps,
    transformItems,
  };

  const wrapper = mount(Menu, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

describe('default render', () => {
  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Menu, {
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

    const wrapper = mount(Menu, {
      propsData: defaultProps,
    });

    expect(wrapper.findAll('.ais-Menu--noRefinement')).toHaveLength(1);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a selected item', () => {
    __setState({
      ...defaultState,
      items: [
        apple,
        {
          ...samsung,
          isRefined: true,
        },
        microsoft,
      ],
    });

    const wrapper = mount(Menu, {
      propsData: defaultProps,
    });

    expect(wrapper.findAll('.ais-Menu-item--selected')).toHaveLength(1);
    expect(wrapper.find('.ais-Menu-item--selected').text()).toBe('Samsung 25');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: value => `/brand/${value}`,
    });

    const wrapper = mount(Menu, {
      propsData: defaultProps,
    });

    expect(wrapper.find('.ais-Menu-link').attributes().href).toBe(
      '/brand/Apple'
    );
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with show more button', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    expect(wrapper.findAll('.ais-Menu-showMore')).toHaveLength(1);
    expect(wrapper.find('.ais-Menu-showMore').text()).toBe('Show more');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with show more button toggled', () => {
    __setState({
      ...defaultState,
      isShowingMore: true,
    });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    expect(wrapper.find('.ais-Menu-showMore').text()).toBe('Show less');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a disabled show more button', () => {
    __setState({
      ...defaultState,
      canToggleShowMore: false,
    });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    const showMoreWrapper = wrapper.find('.ais-Menu-showMore');

    expect(wrapper.findAll('.ais-Menu-showMore')).toHaveLength(1);
    expect(showMoreWrapper.classes()).toContain('ais-Menu-showMore--disabled');
    expect(showMoreWrapper.attributes().disabled).toBe('disabled');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without a show more button (canRefine)', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    expect(wrapper.findAll('.ais-Menu-showMore')).toHaveLength(0);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without a show more button (showMore)', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: false,
      },
    });

    expect(wrapper.findAll('.ais-Menu-showMore')).toHaveLength(0);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on link click', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Menu, {
      propsData: defaultProps,
    });

    wrapper.find('.ais-Menu-link').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple');
  });

  it('calls toggleShowMore on button click', () => {
    const toggleShowMore = jest.fn();

    __setState({
      ...defaultState,
      canToggleShowMore: true,
      toggleShowMore,
    });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    wrapper.find('.ais-Menu-showMore').trigger('click');

    expect(toggleShowMore).toHaveBeenCalledTimes(1);
  });

  it('calls the Panel mixin with `canRefine`', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Menu, {
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
    <div
      slot-scope="state"
      :class="[!state.canRefine && 'no-refinement']"
    >
      <ol>
        <li
          v-for="item in state.items"
          :key="item.value"
        >
          <a
            :href="state.createURL(item.value)"
            @click.prevent="state.refine(item.value)"
          >
            {{item.label}} - {{item.count}}
          </a>
        </li>
      </ol>
      <button
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore"
      >
        {{ state.isShowingMore ? 'Show less' : 'Show more' }}
      </button>
    </div>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Menu, {
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

    const wrapper = mount(Menu, {
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
      createURL: value => `/brand/${value}`,
    });

    const wrapper = mount(Menu, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a show more button toggled', () => {
    __setState({
      ...defaultState,
      isShowingMore: true,
    });

    const wrapper = mount(Menu, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a disabled show more button', () => {
    __setState({
      ...defaultState,
      canToggleShowMore: false,
    });

    const wrapper = mount(Menu, {
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

    const wrapper = mount(Menu, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    wrapper.find('a').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple');
  });

  it('calls toggleShowMore on button click', () => {
    const toggleShowMore = jest.fn();

    __setState({
      ...defaultState,
      canToggleShowMore: true,
      toggleShowMore,
    });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
      },
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    wrapper.find('button').trigger('click');

    expect(toggleShowMore).toHaveBeenCalledTimes(1);
  });
});

describe('custom showMoreLabel render', () => {
  const showMoreLabelScopedSlot = `
    <span slot-scope="{ isShowingMore }">
      {{ isShowingMore ? 'Voir moins' : 'Voir plus' }}
    </span>
  `;

  it('renders correctly with a custom show more label', () => {
    __setState({ ...defaultState });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
      scopedSlots: {
        showMoreLabel: showMoreLabelScopedSlot,
      },
    });

    expect(wrapper.find('.ais-Menu-showMore').text()).toBe('Voir plus');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a custom show more label toggled', () => {
    __setState({
      ...defaultState,
      isShowingMore: true,
    });

    const wrapper = mount(Menu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
      scopedSlots: {
        showMoreLabel: showMoreLabelScopedSlot,
      },
    });

    expect(wrapper.find('.ais-Menu-showMore').text()).toBe('Voir moins');
    expect(wrapper.html()).toMatchSnapshot();
  });
});
