import Vue from 'vue';
import RefinementList from '../RefinementList.vue';

const getFacetValues = jest.fn(() => [
  {
    count: 319,
    isRefined: false,
    name: 'Red',
  },
  {
    count: 200,
    isRefined: true,
    name: 'Blue',
  },
]);
const addFacet = jest.fn();
const searchStore = {
  getFacetValues,
  addFacet,
  stop: () => {},
  start: () => {},
};

test('renders proper HTML', () => {
  const Component = Vue.extend(RefinementList);
  const vm = new Component({
    propsData: {
      attributeName: 'color',
      searchStore,
    },
  });
  vm.$mount();

  expect(vm.$el.outerHTML).toMatchSnapshot();
});

test('should add a facet to the store when created', () => {
  const Component = Vue.extend(RefinementList);
  const addFacetMock = jest.fn();
  const store = Object.assign({}, searchStore, { addFacet: addFacetMock });
  new Component({
    // eslint-disable-line
    propsData: {
      attributeName: 'color',
      searchStore: store,
    },
  });
  expect(addFacetMock).toBeCalledWith('color', 'or');
});

test('should remove the facet from the store when destroyed', () => {
  const Component = Vue.extend(RefinementList);
  const removeFacetMock = jest.fn();
  const store = Object.assign({}, searchStore, {
    removeFacet: removeFacetMock,
  });

  const vm = new Component({
    propsData: {
      attributeName: 'color',
      searchStore: store,
    },
  });

  vm.$mount();

  expect(removeFacetMock).not.toBeCalled();

  vm.$destroy();

  expect(removeFacetMock).toBeCalledWith('color');
});
