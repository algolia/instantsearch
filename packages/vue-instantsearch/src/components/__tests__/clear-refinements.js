import Vue from 'vue';
import ClearRefinements from '../ClearRefinements.vue';
import instantsearch from 'instantsearch.js/es/';

describe.skip('ClearRefinements', () => {
  const Component = Vue.extend(ClearRefinements);

  const stop = jest.fn();
  const start = jest.fn();
  const clearRefinements = jest.fn();
  const refresh = jest.fn();

  const searchStore = {
    query: 'whatever',
    activeRefinements: ['whatever'],
    stop,
    start,
    clearRefinements,
    refresh,
  };

  const instance = instantsearch({
    apiKey: '...',
    appId: '...',
    indexName: '...',
  });

  beforeEach(() => {
    stop.mockClear();
    start.mockClear();
    clearRefinements.mockClear();
    refresh.mockClear();
    searchStore.query = 'whatever';
    searchStore.activeRefinements = ['whatever'];
  });

  test('can clear the search query and the facets at the same time', () => {
    const vm = new Component({
      propsData: { searchStore, instance },
    }).$mount();

    vm.clear();
    expect(searchStore.query).toEqual('');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('can disable query clearing', () => {
    searchStore.query = 'whatever';
    const vm = new Component({
      propsData: { searchStore, instance, clearsQuery: false },
    }).$mount();

    vm.clear();
    expect(searchStore.query).toEqual('whatever');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('can disable facets clearing', () => {
    searchStore.query = 'whatever';
    const vm = new Component({
      propsData: { searchStore, instance, clearsFacets: false },
    });
    vm.clear();
    expect(searchStore.query).toEqual('');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('has proper HTML rendering', () => {
    const vm = new Component({
      propsData: { searchStore, instance },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('has proper HTML rendering when disabled', () => {
    searchStore.query = '';
    searchStore.activeRefinements = [];
    const vm = new Component({
      propsData: { searchStore, instance },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
