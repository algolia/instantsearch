import Vue from 'vue';
import { Pagination } from 'vue-instantsearch';

test('renders proper HTML', () => {
  const goToPage = jest.fn();
  const searchStore = {
    page: 2,
    totalPages: 10,
    goToPage,
  };
  const Component = Vue.extend(Pagination);
  const vm = new Component({
    propsData: {
      searchStore,
    },
  });
  vm.$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('accepts custom padding', () => {
  const goToPage = jest.fn();
  const searchStore = {
    page: 5,
    totalPages: 10,
    goToPage,
  };
  const Component = Vue.extend(Pagination);
  const vm = new Component({
    propsData: {
      padding: 2,
      searchStore,
    },
  });
  vm.$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});
