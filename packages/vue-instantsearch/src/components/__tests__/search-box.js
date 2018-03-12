import Vue from 'vue';
import SearchBox from '../SearchBox.vue';

describe.skip('SearchBox', () => {
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

  test('if search is stalled, hide the submit and display the loader', () => {
    const searchStore = {
      query: '',
      activeRefinements: [], // needed for Clear component
      isSearchStalled: true,
    };
    const Component = Vue.extend(SearchBox);
    const vm = new Component({
      propsData: { searchStore, autofocus: true, showLoadingIndicator: true },
    });

    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('if search is not stalled, show the submit and hide the loader', () => {
    const searchStore = {
      query: '',
      activeRefinements: [], // needed for Clear component
      isSearchStalled: false,
    };
    const Component = Vue.extend(SearchBox);
    const vm = new Component({
      propsData: { searchStore, autofocus: true, showLoadingIndicator: true },
    });

    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
