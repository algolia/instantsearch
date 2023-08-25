/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import Menu from '../Menu.vue';
import '../../../test/utils/sortedHtmlSerializer';

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

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { Menu },
    data() {
      return { props: defaultProps };
    },
    template: `
      <Menu v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </Menu>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});

describe('custom default render', () => {
  const defaultSlot = `
    <template v-slot="state">
      <div :class="[!state.canRefine && 'no-refinement']">
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
    </template>
  `;

  it('renders correctly', () => {
    __setState({ ...defaultState });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('renders correctly without refinement', () => {
    __setState({
      ...defaultState,
      items: [],
      canRefine: false,
    });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('renders correctly with an URL for the href', () => {
    __setState({
      ...defaultState,
      createURL: (value) => `/brand/${value}`,
    });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('renders correctly with a show more button toggled', () => {
    __setState({
      ...defaultState,
      isShowingMore: true,
    });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('renders correctly with a disabled show more button', () => {
    __setState({
      ...defaultState,
      canToggleShowMore: false,
    });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('calls refine on link click', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    await wrapper.find('a').trigger('click');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple');
  });

  it('calls toggleShowMore on button click', async () => {
    const toggleShowMore = jest.fn();

    __setState({
      ...defaultState,
      canToggleShowMore: true,
      toggleShowMore,
    });

    const wrapper = mount({
      components: { Menu },
      data() {
        return { props: defaultProps };
      },
      template: `
        <Menu v-bind="props">
          ${defaultSlot}
        </Menu>
      `,
    });

    await wrapper.find('button').trigger('click');

    expect(toggleShowMore).toHaveBeenCalledTimes(1);
  });
});

describe('custom showMoreLabel render', () => {
  const showMoreLabelSlot = `
    <template v-slot:showMoreLabel="{ isShowingMore }">
      <span>
        {{ isShowingMore ? 'Voir moins' : 'Voir plus' }}
      </span>
    </template>
  `;

  it('renders correctly with a custom show more label', () => {
    __setState({ ...defaultState });

    const props = {
      ...defaultProps,
      showMore: true,
    };
    const wrapper = mount({
      components: { Menu },
      data() {
        return { props };
      },
      template: `
        <Menu v-bind="props">
          ${showMoreLabelSlot}
        </Menu>
      `,
    });

    expect(wrapper.find('.ais-Menu-showMore').text()).toBe('Voir plus');
    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });

  it('renders correctly with a custom show more label toggled', () => {
    __setState({
      ...defaultState,
      isShowingMore: true,
    });

    const props = {
      ...defaultProps,
      showMore: true,
    };
    const wrapper = mount({
      components: { Menu },
      data() {
        return { props };
      },
      template: `
        <Menu v-bind="props">
          ${showMoreLabelSlot}
        </Menu>
      `,
    });

    expect(wrapper.find('.ais-Menu-showMore').text()).toBe('Voir moins');
    expect(wrapper.htmlCompat()).toMatchSnapshot();
  });
});
