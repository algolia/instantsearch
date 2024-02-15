/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Breadcrumb from '../Breadcrumb.vue';
import '../../../test/utils/sortedHtmlSerializer';

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

describe('default render', () => {
  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: (value) => `/${value}`,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on root click', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    await wrapper.find('a').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith();
  });

  it('calls refine on item click', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount(Breadcrumb, {
      propsData: defaultProps,
    });

    await wrapper.find('a:nth-child(2)').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('TV & Home Theater');
  });
});

describe('custom default render', () => {
  const defaultSlot = `
    <template v-slot="{ items, canRefine, refine, createURL }">
      <ul :class="[!canRefine && 'noRefinement']">
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
    </template>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount({
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          ${defaultSlot}
        </Breadcrumb>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount({
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          ${defaultSlot}
        </Breadcrumb>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: (value) => `/${value}`,
    });

    const wrapper = mount({
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          ${defaultSlot}
        </Breadcrumb>
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
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          ${defaultSlot}
        </Breadcrumb>
      `,
    });

    await wrapper.find('a').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('TV & Home Theater');
  });
});

describe('custom rootLabel render', () => {
  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount({
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          <template v-slot:rootLabel>Home page</template>
        </Breadcrumb>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount({
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          <template v-slot:rootLabel>Home page</template>
        </Breadcrumb>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

describe('custom separator render', () => {
  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount({
      components: { Breadcrumb },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Breadcrumb v-bind="props">
          <template v-slot:separator>~~</template>
        </Breadcrumb>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
