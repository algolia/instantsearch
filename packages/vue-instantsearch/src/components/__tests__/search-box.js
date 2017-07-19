import Vue from 'vue';
import { SearchBox } from 'vue-instantsearch';

describe('SearchBox component', () => {
  test('renders proper HTML', () => {
    const searchStore = {
      query: '',
      activeRefinements: [], // needed for Clear component
    };
    const Component = Vue.extend(SearchBox);
    const vm = new Component({
      propsData: { searchStore },
    });

    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('can be autofocused', () => {
    const searchStore = {
      query: '',
      activeRefinements: [], // needed for Clear component
    };
    const Component = Vue.extend(SearchBox);
    const vm = new Component({
      propsData: { searchStore, autofocus: true },
    });

    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
