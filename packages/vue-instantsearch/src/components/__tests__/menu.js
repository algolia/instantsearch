import Vue from 'vue';
import instantsearch from 'instantsearch.js/es/';

import Menu from '../Menu.vue';
import { FACET_TREE } from '../../store';

const instance = instantsearch({
  appId: '...',
  apiKey: '...',
  indexName: '...',
});

const getFacetValues = jest.fn(attributeName => ({
  name: attributeName,
  count: null,
  isRefined: true,
  path: null,
  data: [
    {
      count: 319,
      data: null,
      isRefined: false,
      name: 'Bathroom',
      path: 'Bathroom',
    },
    {
      count: 100,
      data: null,
      isRefined: true,
      name: 'Clothes',
      path: 'Clothes',
    },
    {
      count: 202,
      data: null,
      isRefined: false,
      name: 'Shoes',
      path: 'Shoes',
    },
    {
      count: 398,
      data: null,
      isRefined: false,
      name: 'Kitchen',
      path: 'Kitchen',
    },
  ],
}));

const searchStore = {
  getFacetValues,
  addFacet: () => {},
  setMaxValuesPerFacet: () => {},
  stop: () => {},
  start: () => {},
  refresh: () => {},
};

describe.skip('Menu', () => {
  it('should render correctly', () => {
    const Component = Vue.extend(Menu);
    const vm = new Component({
      propsData: {
        attribute: 'category',
        searchStore,
        instance,
      },
    });
    vm.$mount();
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  it('should render nothing if no menu entries are available', () => {
    const Component = Vue.extend(Menu);

    const store = Object.assign({}, searchStore, {
      getFacetValues: () => ({ data: null }),
    });
    const vm = new Component({
      propsData: {
        attribute: 'category',
        searchStore: store,
        instance,
      },
    });
    vm.$mount();
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  it('should add a facet to the store when created', () => {
    const Component = Vue.extend(Menu);
    const addFacetMock = jest.fn();

    // eslint-disable-next-line no-new
    new Component({
      propsData: {
        attribute: 'category',
        searchStore: Object.assign({}, searchStore, {
          addFacet: addFacetMock,
          setMaxValuesPerFacet: () => {},
        }),
        instance,
      },
    });

    expect(addFacetMock).toBeCalledWith(
      {
        name: 'category',
        attributes: ['category'],
      },
      FACET_TREE
    );
  });

  it('should remove the facet from the store when destroyed', () => {
    const Component = Vue.extend(Menu);
    const removeFacetMock = jest.fn();

    const vm = new Component({
      propsData: {
        attribute: 'category',
        searchStore: Object.assign({}, searchStore, {
          removeFacet: removeFacetMock,
        }),
        instance,
      },
    });

    vm.$mount();
    vm.$destroy();

    expect(removeFacetMock).toBeCalledWith('category');
  });

  it('should set `maxValuesPerFacet` when mounted', () => {
    const Component = Vue.extend(Menu);
    const store = Object.assign({}, searchStore);

    // eslint-disable-next-line no-new
    new Component({
      propsData: {
        limit: 10,
        attribute: 'category',
        searchStore: store,
        instance,
      },
    });

    expect(store.maxValuesPerFacet).toBe(10);
  });
});
