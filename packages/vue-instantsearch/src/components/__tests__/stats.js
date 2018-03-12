import Vue from 'vue';
import Stats from '../Stats.vue';

const searchStore = {
  query: 'search query',
  totalResults: 10000,
  processingTimeMS: 1000,
};

describe.skip('Stats', () => {
  test('renders proper HTML', () => {
    const Component = Vue.extend(Stats);
    const vm = new Component({
      propsData: {
        searchStore,
      },
    }).$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('should not be displayed if there are no results', () => {
    const Component = Vue.extend(Stats);
    const vm = new Component({
      propsData: {
        searchStore: Object.assign({}, searchStore, { totalResults: 0 }),
      },
    }).$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
