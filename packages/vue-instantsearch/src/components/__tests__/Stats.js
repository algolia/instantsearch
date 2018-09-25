import { mount } from '@vue/test-utils';

import Stats from '../Stats.vue';

import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');
it('renders correctly', () => {
  __setState({
    hitsPerPage: 50,
    nbPages: 20,
    nbHits: 1000,
    page: 2,
    processingTimeMS: 12,
    query: 'ipho',
    instantSearchInstance: {
      helper: {
        lastResults: [],
      },
    },
  });

  const wrapper = mount(Stats);
  expect(wrapper.html()).toMatchSnapshot();
});
