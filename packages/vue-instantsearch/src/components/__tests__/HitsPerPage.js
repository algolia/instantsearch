import { mount } from '@vue/test-utils';

import HitsPerPage from '../HitsPerPage.vue';
jest.mock('../../component');

it('renders correctly', () => {
  const wrapper = mount(HitsPerPage, {
    propsData: {
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
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

it('behaves correctly', () => {
  const wrapper = mount(HitsPerPage, {
    propsData: {
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
    },
  });
  // This is bad 👇🏽 but the only way for now to trigger changes
  // on a select: https://github.com/vuejs/vue-test-utils/issues/260
  wrapper.vm.selected = 20;
  wrapper.find('select').trigger('change');
  expect(wrapper.vm.state.refine).toHaveBeenLastCalledWith(20);
});
