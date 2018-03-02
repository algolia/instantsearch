import Vue from 'vue';

import Menu from '../Menu.vue';
import { FACET_TREE } from '../../store';

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

describe('Menu', () => {
  it('should render correctly', () => {
    const Component = Vue.extend(Menu);
    const vm = new Component({
      propsData: {
        attribute: 'category',
        searchStore,
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
      },
    });
    vm.$mount();
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  it('should add a facet to the store when created', () => {
    const Component = Vue.extend(Menu);
    const addFacetMock = jest.fn();

    new Component({ // eslint-disable-line
      propsData: {
        attribute: 'category',
        searchStore: Object.assign({}, searchStore, {
          addFacet: addFacetMock,
          setMaxValuesPerFacet: () => {},
        }),
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
      },
    });

    vm.$mount();
    vm.$destroy();

    expect(removeFacetMock).toBeCalledWith('category');
  });

  it('should set `maxValuesPerFacet` when mounted', () => {
    const Component = Vue.extend(Menu);
    const store = Object.assign({}, searchStore);

    new Component({ // eslint-disable-line
      propsData: {
        limit: 10,
        attribute: 'category',
        searchStore: store,
      },
    });

    expect(store.maxValuesPerFacet).toBe(10);
  });
});
