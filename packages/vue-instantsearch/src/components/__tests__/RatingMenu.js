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
    items: [
      { isRefined: false, count: 20, value: 1 },
      { isRefined: false, count: 3, value: 2 },
      { isRefined: false, count: 2000, value: 3 },
      { isRefined: false, count: 8, value: 4 },
    ],
  });

  const wrapper = mount(RatingMenu, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly when refined', () => {
  __setState({
    items: [
      { isRefined: false, count: 20, value: 1 },
      { isRefined: false, count: 3, value: 2 },
      { isRefined: false, count: 2000, value: 3 },
      { isRefined: true, count: 8, value: 4 },
    ],
  });

  const wrapper = mount(RatingMenu, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('calls refine when clicked on link', () => {
  __setState({
    items: [
      { isRefined: false, count: 20, value: 1 },
      { isRefined: false, count: 3, value: 2 },
      { isRefined: false, count: 2000, value: 3 },
      { isRefined: false, count: 8, value: 4 },
    ],
    refine: jest.fn(),
  });

  const wrapper = mount(RatingMenu, {
    propsData: defaultProps,
  });

  wrapper.find('.ais-RatingMenu-link').trigger('click');

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(1);
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
