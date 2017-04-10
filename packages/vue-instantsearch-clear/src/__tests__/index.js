import Clear from 'vue-instantsearch-clear';
import Vue from 'vue';

describe('Clear component', () => {
  const Component = Vue.extend(Clear);

  const stop = jest.fn();
  const start = jest.fn();
  const clearRefinements = jest.fn();

  const searchStore = {
    query: 'whatever',
    activeRefinements: ['whatever'],
    stop,
    start,
    clearRefinements
  };

  beforeEach(() => {
    stop.mockClear();
    start.mockClear();
    clearRefinements.mockClear();
    searchStore.query = 'whatever';
    searchStore.activeRefinements = ['whatever'];
  });

  test('Can clear the search query and the facets at the same time', () => {
    const vm = new Component({
      propsData: { searchStore }
    });

    vm.clear();
    expect(searchStore.query).toEqual('');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
  });

  test('Can disable query clearing', () => {
    searchStore.query = 'whatever';
    const vm = new Component({
      propsData: { searchStore, clearQuery: false }
    });
    vm.clear();
    expect(searchStore.query).toEqual('whatever');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
  });

  test('Can disable facets clearing', () => {
    searchStore.query = 'whatever';
    const vm = new Component({
      propsData: { searchStore, clearFacets: false }
    });
    vm.clear();
    expect(searchStore.query).toEqual('');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
  });

  test('Has proper HTML rendering', () => {
    const vm = new Component({
      propsData: { searchStore }
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('Has proper HTML rendering when disabled', () => {
    searchStore.query = '';
    searchStore.activeRefinements = [];
    const vm = new Component({
      propsData: { searchStore }
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
