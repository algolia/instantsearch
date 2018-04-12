import { mount } from '@vue/test-utils';
import Template from '../__Template.vue';
import { __setState } from '../../component';
jest.mock('../../component');

it('renders correctly', () => {
  __setState({
    hits: ['yo', 'how', 'are', 'you', 'doing', '?'],
  });
  const wrapper = mount(Template);
  expect(wrapper.html()).toMatchSnapshot();
});

// ☑️ add another rendering test if it's different given the propsData

it('behaves correctly', () => {
  const wrapper = mount(Template);
  const button = wrapper.find('button');
  button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith('hi');
});
