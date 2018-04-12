import { mount } from '@vue/test-utils';

import Stats from '../Stats.vue';

import { __setState } from '../../component';
jest.mock('../../component');
it('renders correctly', () => {
  __setState({
    hitsPerPage: 50,
    nbPages: 20,
    nbHits: 1000,
    page: 2,
    processingTimeMS: 12,
    query: 'ipho',
  });
  const wrapper = mount(Stats);
  expect(wrapper.html()).toMatchSnapshot();
});
