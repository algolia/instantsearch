import Vue from 'vue';
import Results from '../Results.vue';
describe.skip('Results', () => {
  test('renders proper HTML', () => {
    const searchStore = {
      results: [
        { objectID: 1 },
        { objectID: 2 },
        { objectID: 3 },
        { objectID: 4 },
      ],
    };
    const Component = Vue.extend(Results);
    const vm = new Component({
      propsData: {
        searchStore,
      },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('should be hidden if not results are yielded', () => {
    const searchStore = {
      results: [],
    };
    const Component = Vue.extend(Results);
    const vm = new Component({
      propsData: {
        searchStore,
      },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('should allow to override result rendering', () => {
    const searchStore = {
      results: [{ objectID: 1 }, { objectID: 2 }],
    };

    const Component = Vue.extend({
      render(h) {
        return h('ais-results', {
          props: { searchStore },
          scopedSlots: {
            default: ({ result }) => h('h2', result.objectID),
          },
        });
      },
      components: {
        'ais-results': Results,
      },
    });

    const vm = new Component();

    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('can stack results', () => {
    const searchStore = {
      page: 1,
      results: [{ objectID: 1 }, { objectID: 2 }],
    };
    const Component = Vue.extend(Results);
    const vm = new Component({
      propsData: {
        searchStore,
        stack: true,
      },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();

    vm.searchStore.page = 2;
    vm.searchStore.results = [{ objectID: 3 }, { objectID: 4 }];

    vm.$nextTick(() => {
      expect(vm.$el.outerHTML).toMatchSnapshot();
    });
  });

  test('should not stack results by default', () => {
    const searchStore = {
      page: 1,
      results: [{ objectID: 1 }, { objectID: 2 }],
    };
    const Component = Vue.extend(Results);
    const vm = new Component({
      propsData: {
        searchStore,
      },
    });
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();

    vm.searchStore.page = 2;
    vm.searchStore.results = [{ objectID: 3 }, { objectID: 4 }];

    vm.$nextTick(() => {
      expect(vm.$el.outerHTML).toMatchSnapshot();
    });
  });
});
