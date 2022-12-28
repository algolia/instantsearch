/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import Template from '../__Template.vue';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

it('renders correctly', () => {
  __setState({
    hits: ['yo', 'how', 'are', 'you', 'doing', '?'],
  });
  const wrapper = mount(Template);
  expect(wrapper.html()).toMatchSnapshot();
});

// ☑️ add another rendering test if it's different given the propsData

it('behaves correctly', async () => {
  __setState({
    refine: jest.fn(),
  });
  const wrapper = mount(Template);
  const button = wrapper.find('button');
  await button.trigger('click');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith('hi');
});
