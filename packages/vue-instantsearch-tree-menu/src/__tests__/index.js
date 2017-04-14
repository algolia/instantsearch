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
