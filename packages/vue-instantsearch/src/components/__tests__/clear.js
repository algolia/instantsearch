import Vue from 'vue';
import Clear from '../Clear.vue';

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
    clearRefinements,
  };

  beforeEach(() => {
    stop.mockClear();
    start.mockClear();
    clearRefinements.mockClear();
    searchStore.query = 'whatever';
    searchStore.activeRefinements = ['whatever'];
  });

  test('can clear the search query and the facets at the same time', () => {
    const vm = new Component({
      propsData: { searchStore },
    });

    vm.clear();
    expect(searchStore.query).toEqual('');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
  });

  test('can disable query clearing', () => {
    searchStore.query = 'whatever';
    const vm = new Component({
      propsData: { searchStore, clearsQuery: false },
    });
    vm.clear();
    expect(searchStore.query).toEqual('whatever');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
  });

  test('can disable facets clearing', () => {
    searchStore.query = 'whatever';
    const vm = new Component({
      propsData: { searchStore, clearsFacets: false },
    });
    vm.clear();
    expect(searchStore.query).toEqual('');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(clearRefinements).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
  });

  test('has proper HTML rendering', () => {
    const vm = new Component({
      propsData: { searchStore },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('has proper HTML rendering when disabled', () => {
    searchStore.query = '';
    searchStore.activeRefinements = [];
    const vm = new Component({
      propsData: { searchStore },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
