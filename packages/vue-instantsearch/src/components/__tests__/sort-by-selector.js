import Vue from 'vue';
import SortBySelector from '../SortBySelector.vue';

describe.skip('SortBy', () => {
  test('renders proper HTML', () => {
    const searchStore = {};
    const Component = Vue.extend(SortBySelector);
    const vm = new Component({
      propsData: {
        searchStore,
        indices: [
          { name: 'index1', label: 'label1' },
          { name: 'index2', label: 'label2' },
        ],
      },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('should use current index name in search store if it is a valid option', () => {
    const searchStore = {
      indexName: 'index2',
    };
    const Component = Vue.extend(SortBySelector);
    const vm = new Component({
      propsData: {
        searchStore,
        indices: [
          { name: 'index1', label: 'label1' },
          { name: 'index2', label: 'label2' },
        ],
      },
    });

    expect(vm.searchStore.indexName).toEqual('index2');

    vm.$mount();

    expect(vm.$el.getElementsByTagName('option')[0].selected).toEqual(false);
    expect(vm.$el.getElementsByTagName('option')[1].selected).toEqual(true);
  });

  test('should use first index if current index name is not a valid option', () => {
    const searchStore = {
      indexName: 'index3',
    };
    const Component = Vue.extend(SortBySelector);
    const vm = new Component({
      propsData: {
        searchStore,
        indices: [
          { name: 'index1', label: 'label1' },
          { name: 'index2', label: 'label2' },
        ],
      },
    });

    expect(vm.searchStore.indexName).toEqual('index1');

    vm.$mount();

    expect(vm.$el.getElementsByTagName('option')[0].selected).toEqual(true);
  });
});
