import { mount } from '@vue/test-utils';
import { __setState } from '../../component';
import Hits from '../Hits.vue';
jest.mock('../../component');

it('renders correctly', () => {
  __setState({
    hits: [{ objectID: 'one' }, { objectID: 'two' }],
  });
  const wrapper = mount(Hits);
  expect(wrapper.html()).toMatchSnapshot();
});
