import { mount } from '@vue/test-utils';
import RatingMenu from '../RatingMenu.vue';
import { __setState } from '../../component';
jest.mock('../../component');

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
    propsData: {
      attribute: 'hi',
    },
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
    propsData: {
      attribute: 'hi',
    },
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
    propsData: {
      attribute: 'hi',
    },
  });
  const link = wrapper.find('.ais-RatingMenu-link');
  link.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(1);
});
