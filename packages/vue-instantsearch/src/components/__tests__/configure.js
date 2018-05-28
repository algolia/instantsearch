import { mount } from '@vue/test-utils';
import Configure from '../Configure.vue';
import { __setState } from '../../component';
jest.mock('../../component');

it('renders correctly', () => {
  __setState({
    widgetParams: {
      searchParameters: {},
    },
  });
  const wrapper = mount(Configure);
  expect(wrapper.html()).toMatchSnapshot();
});
