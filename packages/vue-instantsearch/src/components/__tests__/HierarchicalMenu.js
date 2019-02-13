import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
import HierarchicalMenu from '../HierarchicalMenu.vue';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const apple = {
  label: 'Apple',
  value: 'Apple',
  isRefined: false,
  count: 80,
  data: null,
};

const macbook = {
  label: 'MacBook',
  value: 'Apple > MacBook',
  isRefined: false,
  count: 40,
  data: null,
};

const iphone = {
  label: 'iPhone',
  value: 'Apple > iPhone',
  isRefined: false,
  count: 20,
  data: null,
};

const ipad = {
  label: 'iPad',
  value: 'Apple > iPad',
  isRefined: false,
  count: 20,
  data: null,
};

const macbook13 = {
  label: 'MacBook 13"',
  value: 'Apple > MacBook > MacBook 13"',
  isRefined: false,
  count: 20,
  data: null,
};

const macbook15 = {
  label: 'MacBook 15"',
  value: 'Apple > MacBook > MacBook 15"',
  isRefined: false,
  count: 10,
  data: null,
};

const macbook12 = {
  label: 'MacBook 12',
  value: 'Apple > MacBook > MacBook',
  isRefined: false,
  count: 10,
  data: null,
};

const samsung = {
  label: 'Samsung',
  value: 'Samsung',
  isRefined: false,
  count: 40,
  data: null,
};

const galaxy = {
  label: 'Galaxy',
  value: 'Samsung > Galaxy',
  isRefined: false,
  count: 30,
  data: null,
};

const note = {
  label: 'Note',
  value: 'Samsung > Note',
  isRefined: false,
  count: 10,
  data: null,
};

const microsoft = {
  label: 'Microsoft',
  value: 'Microsoft',
  isRefined: false,
  count: 20,
  data: null,
};

const defaultState = {
  items: [
    {
      ...apple,
      data: [
        iphone,
        ipad,
        {
          ...macbook,
          data: [macbook13, macbook15, macbook12],
        },
      ],
    },
    {
      ...samsung,
      data: [galaxy, note],
    },
    microsoft,
  ],
  refine: () => {},
  createURL: () => {},
  isShowingMore: false,
  canToggleShowMore: true,
  toggleShowMore: () => {},
};

const defaultProps = {
  attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
};

it('accepts an attributes prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: defaultProps,
  });

  expect(wrapper.vm.widgetParams.attributes).toEqual([
    'categories.lvl0',
    'categories.lvl1',
    'categories.lvl2',
  ]);
});

it('accepts a limit prop (without showMore)', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: {
      ...defaultProps,
      showMore: false,
      limit: 2,
      showMoreLimit: 5,
    },
  });

  expect(wrapper.vm.widgetParams.limit).toBe(2);
});

it('accepts a showMoreLimit prop (with showMore)', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: {
      ...defaultProps,
      showMore: true,
      limit: 2,
      showMoreLimit: 5,
    },
  });

  expect(wrapper.vm.widgetParams.showMoreLimit).toBe(5);
});

it('accepts a separator prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: {
      ...defaultProps,
      separator: ' --> ',
    },
  });

  expect(wrapper.vm.widgetParams.separator).toBe(' --> ');
});

it('accepts a rootPath prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: {
      ...defaultProps,
      rootPath: 'Apple > MacBook',
    },
  });

  expect(wrapper.vm.widgetParams.rootPath).toBe('Apple > MacBook');
});

it('accepts a showParentLevel prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: {
      ...defaultProps,
      showParentLevel: false,
    },
  });

  expect(wrapper.vm.widgetParams.showParentLevel).toBe(false);
});

it('accepts a sortBy prop', () => {
  __setState({
    ...defaultState,
  });

  const wrapper = mount(HierarchicalMenu, {
    propsData: {
      ...defaultProps,
      sortBy: ['count:asc'],
    },
  });

  expect(wrapper.vm.widgetParams.sortBy).toEqual(['count:asc']);
});

it('accepts a transformItems prop', () => {
  __setState({
    ...defaultState,
  });

  const transformItems = () => {};

  const wrapper = mount(HierarchicalMenu, {
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

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly the parent of sub categories', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    expect(wrapper.findAll('.ais-HierarchicalMenu-item--parent')).toHaveLength(
      3 // 2 Apple + 1 Samsung
    );
  });

  it('renders correctly the list of sub categories', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    expect(wrapper.findAll('.ais-HierarchicalMenu-list--lvl0')).toHaveLength(1);
    expect(wrapper.findAll('.ais-HierarchicalMenu-list--lvl1')).toHaveLength(2);
    expect(wrapper.findAll('.ais-HierarchicalMenu-list--lvl2')).toHaveLength(1);

    expect(wrapper.findAll('.ais-HierarchicalMenu-list--child')).toHaveLength(
      3 // 2 Apple + 1 Samsung
    );
  });

  it('renders correctly with a URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: value => `/categories/${value}`,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly a sub categories selected', () => {
    __setState({
      ...defaultState,
      items: [
        {
          ...apple,
          isRefined: true,
          data: [
            iphone,
            ipad,
            {
              ...macbook,
              isRefined: true,
              data: [macbook13, macbook15, macbook12],
            },
          ],
        },
        {
          ...samsung,
          data: [galaxy, note],
        },
        microsoft,
      ],
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    expect(
      wrapper.findAll('.ais-HierarchicalMenu-item--selected')
    ).toHaveLength(2);

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with show more disabled', () => {
    __setState({
      ...defaultState,
      canToggleShowMore: false,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    const button = wrapper.find('button');
    expect(button.attributes().disabled).toBe('disabled');
    expect(button.classes()).toContain(
      'ais-HierarchicalMenu-showMore--disabled'
    );

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with show more label', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
      },
    });

    const showMoreButton = wrapper.find('.ais-HierarchicalMenu-showMore');

    expect(showMoreButton.text()).toBe('Show more');
    expect(showMoreButton.html()).toMatchSnapshot();
  });

  it('renders correctly with show more label toggled', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
        limit: 1,
      },
    });

    const button = wrapper.find('button');

    button.trigger('click');

    wrapper.setData({
      state: {
        isShowingMore: true,
      },
    });

    expect(button.text()).toBe('Show less');
    expect(button.html()).toMatchSnapshot();
  });

  it('calls refine on link click', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    wrapper
      .find('.ais-HierarchicalMenu-list--lvl2')
      .findAll('a')
      .at(1)
      .trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple > MacBook > MacBook 15"');
  });

  it('calls toggleShowMore on button click', () => {
    const toggleShowMore = jest.fn();
    __setState({
      ...defaultState,
      toggleShowMore,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
        limit: 1,
      },
    });

    wrapper.find('button').trigger('click');

    expect(toggleShowMore).toHaveBeenCalledTimes(1);
  });

  it('calls the Panel mixin with `items.length`', () => {
    __setState({ ...defaultState });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
    });

    const mapStateToCanRefine = () =>
      wrapper.vm.mapStateToCanRefine(wrapper.vm.state);

    expect(mapStateToCanRefine()).toBe(true);

    wrapper.setData({
      state: {
        items: [],
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
          <ol v-if="item.data">
            <li
              v-for="child in item.data"
              :key="child.value"
            >
              <a
                :href="state.createURL(child.value)"
                @click.prevent="state.refine(child.value)"
              >
                {{child.label}} - {{child.count}}
              </a>
            </li>
          </ol>
        </li>
      </ol>
      <button
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore"
      >
        {{ state.isShowingMore ? 'View less' : 'View more' }}
      </button>
    </div>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount(HierarchicalMenu, {
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
    });

    const wrapper = mount(HierarchicalMenu, {
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
      createURL: value => `/categories/${value.replace(/ > /g, '/')}`,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a limit', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        limit: 1,
      },
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a show more button toggled', () => {
    __setState({
      ...defaultState,
      toggleShowMore: () => {
        wrapper.setData({
          state: {
            isShowingMore: true,
          },
        });
      },
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        limit: 1,
      },
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.find('button').text()).toBe('View more');
    expect(wrapper.html()).toMatchSnapshot();

    wrapper.find('button').trigger('click');

    expect(wrapper.find('button').text()).toBe('View less');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a disabled show more button', () => {
    __setState({
      ...defaultState,
      canToggleShowMore: false,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.find('button').attributes().disabled).toBe('disabled');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on link click', () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: defaultProps,
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    wrapper
      .findAll('ol')
      .at(1)
      .findAll('a')
      .at(2)
      .trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple > MacBook');
  });

  it('calls toggleShowMore on button click', () => {
    __setState({
      ...defaultState,
      toggleShowMore: () => {
        wrapper.setData({ state: { isShowingMore: true } });
      },
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
        limit: 1,
      },
      scopedSlots: {
        default: defaultScopedSlot,
      },
    });

    expect(wrapper.vm.state.isShowingMore).toBe(false);

    wrapper.find('button').trigger('click');

    expect(wrapper.vm.state.isShowingMore).toBe(true);
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

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
        limit: 1,
      },
      scopedSlots: {
        showMoreLabel: showMoreLabelScopedSlot,
      },
    });

    expect(wrapper.find('.ais-HierarchicalMenu-showMore').text()).toBe(
      'Voir plus'
    );

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a custom show more label toggled', () => {
    __setState({
      ...defaultState,
      toggleShowMore: () => wrapper.setData({ state: { isShowingMore: true } }),
    });

    const wrapper = mount(HierarchicalMenu, {
      propsData: {
        ...defaultProps,
        showMore: true,
        limit: 1,
      },
      scopedSlots: {
        showMoreLabel: showMoreLabelScopedSlot,
      },
    });

    wrapper.find('button').trigger('click');

    expect(wrapper.find('.ais-HierarchicalMenu-showMore').text()).toBe(
      'Voir moins'
    );

    expect(wrapper.html()).toMatchSnapshot();
  });
});
