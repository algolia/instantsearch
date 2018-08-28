import { mount } from '@vue/test-utils';
import { __setState } from '../../component';
import HitsPerPage from '../HitsPerPage.vue';

jest.mock('../../component');
jest.mock('../../panel');

const defaultProps = {
  items: [
    {
      label: '10 results',
      value: 10,
      default: true,
    },
    {
      label: '20 results',
      value: 20,
    },
  ],
};

it('renders correctly', () => {
  const wrapper = mount(HitsPerPage, {
    propsData: defaultProps,
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('calls `refine` with the `value` on `change`', () => {
  __setState({
    refine: jest.fn(),
  });

  const wrapper = mount(HitsPerPage, {
    propsData: defaultProps,
  });

  // This is bad 👇🏽 but the only way for now to trigger changes
  // on a select: https://github.com/vuejs/vue-test-utils/issues/260
  wrapper.vm.selected = 20;

  wrapper.find('select').trigger('change');

  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(20);
});

it('calls the Panel mixin with `hasNoResults`', () => {
  __setState({ hasNoResults: false });

  const wrapper = mount(HitsPerPage, {
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
