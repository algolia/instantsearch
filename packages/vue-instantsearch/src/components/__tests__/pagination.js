import Vue from 'vue';
import { Pagination } from 'vue-instantsearch';

test('renders proper HTML', () => {
  const searchStore = {
    page: 2,
    totalPages: 10,
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
  const searchStore = {
    page: 5,
    totalPages: 10,
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

test('it should not try to go to a previous page that would be inferior to 1', () => {
  const searchStore = {
    page: 1,
    totalPages: 20,
  };
  const Component = Vue.extend(Pagination);
  const vm = new Component({
    propsData: {
      searchStore,
    },
  });

  vm.goToPreviousPage();

  expect(searchStore.page).toEqual(1);
});

test('it should not try to go to a next page that would be superior to total existing pages', () => {
  const searchStore = {
    page: 20,
    totalPages: 20,
  };
  const Component = Vue.extend(Pagination);
  const vm = new Component({
    propsData: {
      searchStore,
    },
  });

  vm.goToNextPage();

  expect(searchStore.page).toEqual(20);
});
