/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import NumericMenu from '../NumericMenu.vue';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const all = {
  label: 'All',
  value: 'all',
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
  canRefine: true,
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

  const identity = (x) => x;

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
      canRefine: false,
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

  it('calls refine on radio change', async () => {
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

    const input = wrapper.find(
      '.ais-NumericMenu-item:nth-child(4) .ais-NumericMenu-radio'
    );

    await input.trigger('change');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('100'));
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('500'));
  });
});

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { NumericMenu },
    data() {
      return { props: defaultProps };
    },
    template: `
      <NumericMenu v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </NumericMenu>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});

describe('custom default render', () => {
  const defaultSlot = `
    <template v-slot="{ items, canRefine, refine, createURL }">
      <ul :class="[!canRefine && 'no-refinement']">
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
    </template>
  `;

  it('renders correctly', () => {
    __setState(defaultState);

    const wrapper = mount({
      components: { NumericMenu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <NumericMenu v-bind="props">
          ${defaultSlot}
        </NumericMenu>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      canRefine: false,
    });

    const wrapper = mount({
      components: { NumericMenu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <NumericMenu v-bind="props">
          ${defaultSlot}
        </NumericMenu>
      `,
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

    const wrapper = mount({
      components: { NumericMenu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <NumericMenu v-bind="props">
          ${defaultSlot}
        </NumericMenu>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: (value = 'all') => `/price/${value}`,
    });

    const wrapper = mount({
      components: { NumericMenu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <NumericMenu v-bind="props">
          ${defaultSlot}
        </NumericMenu>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on link click', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount({
      components: { NumericMenu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <NumericMenu v-bind="props">
          ${defaultSlot}
        </NumericMenu>
      `,
    });

    const link = wrapper.find('li:nth-child(4) a');

    await link.trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('100'));
    expect(refine).toHaveBeenCalledWith(expect.stringContaining('500'));
  });
});
