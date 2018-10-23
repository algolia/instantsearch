import { mount } from '@vue/test-utils';
import RatingMenu from '../RatingMenu.vue';
import { __setState } from '../../mixins/widget';

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

it('calls refine when clicked on link', () => {
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

  wrapper.find('.ais-RatingMenu-link').trigger('click');

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith('1');
});

it('calls the Panel mixin with `hasNoResults`', () => {
  __setState({ hasNoResults: false });

  const wrapper = mount(RatingMenu, {
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
