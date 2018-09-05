import { mount } from '@vue/test-utils';
import Configure from '../Configure.vue';
import { __setState } from '../../mixins/component';
jest.mock('../../mixins/component');

it('renders correctly', () => {
  __setState({
    widgetParams: {
      searchParameters: {},
    },
  });
  const wrapper = mount(Configure);
  expect(wrapper.html()).toMatchSnapshot();
});
