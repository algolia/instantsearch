/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import RatingMenu from '../RatingMenu.vue';
import { __setState } from '../../mixins/widget';
import '../../../test/utils/sortedHtmlSerializer';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultProps = {
  attribute: 'popularity',
};

it('renders correctly', () => {
  __setState({
    createURL: () => '#',
    items: [
      {
        isRefined: false,
        count: 20,
        value: '1',
        stars: [true, false, false, false, false],
      },
      {
        isRefined: false,
        count: 3,
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        isRefined: false,
        count: 2000,
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        isRefined: false,
        count: 8,
        value: '4',
        stars: [true, true, true, true, false],
      },
    ],
  });

  const wrapper = mount(RatingMenu, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly when refined', () => {
  __setState({
    createURL: () => '#',
    items: [
      {
        isRefined: false,
        count: 20,
        value: '1',
        stars: [true, false, false, false, false],
      },
      {
        isRefined: false,
        count: 3,
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        isRefined: false,
        count: 2000,
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        isRefined: true,
        count: 8,
        value: '4',
        stars: [true, true, true, true, false],
      },
    ],
  });

  const wrapper = mount(RatingMenu, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('calls refine when clicked on link', async () => {
  __setState({
    createURL: () => '#',
    items: [
      {
        isRefined: false,
        count: 20,
        value: '1',
        stars: [true, false, false, false, false],
      },
      {
        isRefined: false,
        count: 3,
        value: '2',
        stars: [true, true, false, false, false],
      },
      {
        isRefined: false,
        count: 2000,
        value: '3',
        stars: [true, true, true, false, false],
      },
      {
        isRefined: false,
        count: 8,
        value: '4',
        stars: [true, true, true, true, false],
      },
    ],
    refine: jest.fn(),
  });

  const wrapper = mount(RatingMenu, {
    propsData: defaultProps,
  });

  await wrapper.find('.ais-RatingMenu-link').trigger('click');

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith('1');
});

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    createURL: () => '#',
    items: [],
    sendEvent,
  });

  const wrapper = mount({
    components: { RatingMenu },
    data() {
      return { props: defaultProps };
    },
    template: `
      <RatingMenu v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </RatingMenu>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});
