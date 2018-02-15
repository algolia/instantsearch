import Vue from 'vue';
import Pagination from '../Pagination.vue';

test('renders proper HTML', () => {
  const searchStore = {
    page: 2,
    totalPages: 10,
    totalResults: 4000,
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
    totalResults: 4000,
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
    totalResults: 4000,
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
    totalResults: 4000,
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

test('it should be hidden if there are no results in the current context', () => {
  const searchStore = {
    page: 1,
    totalPages: 20,
    totalResults: 0,
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

test('it should emit a "page-change" event when page changes and pass in the page variable', () => {
  const searchStore = {
    page: 1,
    totalPages: 20,
    totalResults: 4000,
  };
  const Component = Vue.extend(Pagination);
  const vm = new Component({
    propsData: {
      searchStore,
    },
  });

  const onPageChange = jest.fn();
  vm.$on('page-change', onPageChange);

  vm.$mount();

  expect(onPageChange).not.toHaveBeenCalled();

  vm.$el
    .getElementsByTagName('li')[3]
    .getElementsByTagName('a')[0]
    .click();
  expect(onPageChange).toHaveBeenCalledTimes(1);

  const page = searchStore.page;
  expect(onPageChange).toHaveBeenCalledWith(page);
  expect(page).toBe(2);
});
