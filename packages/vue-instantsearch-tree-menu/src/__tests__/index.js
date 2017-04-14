import { FACET_TREE } from 'instantsearch-store';
import TreeMenu from 'vue-instantsearch-tree-menu';
import Vue from 'vue';

const getFacetValues = jest.fn(attributeName => {
  return {
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
        count: 200,
        data: [
          {
            count: 43,
            data: null,
            isRefined: false,
            name: 'Bakeware',
            path: 'Cooking > Bakeware',
          },
        ],
        isRefined: true,
        name: 'Cooking',
        path: 'Cooking',
      },
    ],
  };
});
const addFacet = jest.fn();
const searchStore = {
  getFacetValues,
  addFacet,
};

test('renders proper HTML', () => {
  const Component = Vue.extend(TreeMenu);
  const vm = new Component({
    propsData: {
      attributes: ['category.lvl1', 'category.lvl2'],
      searchStore,
    },
  });
  vm.$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('should add a tree facet to the store when mounted', () => {
  const Component = Vue.extend(TreeMenu);
  const addFacetMock = jest.fn();
  const store = Object.assign({}, searchStore, { addFacet: addFacetMock });
  const vm = new Component({
    propsData: {
      attributes: ['category.lvl1', 'category.lvl2'],
      searchStore: store,
    },
  });

  expect(addFacetMock).not.toBeCalled();
  vm.$mount();
  expect(addFacetMock).toBeCalledWith(
    {
      name: 'tree-menu',
      attributes: ['category.lvl1', 'category.lvl2'],
      separator: ' > ',
    },
    FACET_TREE
  );
});

test('should remove the tree facet from the store when destroyed', () => {
  const Component = Vue.extend(TreeMenu);
  const removeFacetMock = jest.fn();
  const store = Object.assign({}, searchStore, {
    removeFacet: removeFacetMock,
  });

  const vm = new Component({
    propsData: {
      attributes: ['category.lvl1', 'category.lvl2'],
      searchStore: store,
    },
  });

  vm.$mount();

  expect(removeFacetMock).not.toBeCalled();

  vm.$destroy();

  expect(removeFacetMock).toBeCalledWith('tree-menu');
});
