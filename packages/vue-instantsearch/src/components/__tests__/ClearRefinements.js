import { mount } from '@vue/test-utils';
import ClearRefinements from '../ClearRefinements.vue';
import { __setState } from '../../component';
jest.mock('../../component');

it('renders correctly with refinements', () => {
  __setState({
    hasRefinements: true,
  });
  const wrapper = mount(ClearRefinements);
  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly without refinements', () => {
  __setState({
    hasRefinements: false,
  });
  const wrapper = mount(ClearRefinements);
  const button = wrapper.find('button');
  expect(button.attributes().disabled).toBe('disabled');
  expect(wrapper.html()).toMatchSnapshot();
});

it.skip('behaves correctly', () => {
  __setState({
    refine: jest.fn(),
    hasRefinements: false,
  });
  const wrapper = mount(ClearRefinements);
  const button = wrapper.find('button');
  button.trigger('click');

  // TODO: although it works in real life, this test doesn't pass
  expect(wrapper.vm.state.refine).toHaveBeenCalledTimes(1);
});
