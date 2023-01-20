/**
 * @jest-environment jsdom
 */
import {
  createRefinementListTests,
  createHierarchicalMenuTests,
  createMenuTests,
  createPaginationTests,
} from '@instantsearch/tests';

import { nextTick } from '../../test/utils';
import { renderCompat, Vue } from '../util/vue-compat';
import {
  AisInstantSearch,
  AisRefinementList,
  AisHierarchicalMenu,
  AisMenu,
  AisPagination,
} from '../instantsearch';
jest.unmock('instantsearch.js/es');

createRefinementListTests(async ({ instantSearchOptions, attribute }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vm = new Vue({
    render: renderCompat((h) =>
      h(AisInstantSearch, { props: instantSearchOptions }, [
        h(AisRefinementList, { props: { attribute } }),
      ])
    ),
  }).$mount(container);

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});

createHierarchicalMenuTests(async ({ instantSearchOptions, attributes }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vm = new Vue({
    render: renderCompat((h) =>
      h(AisInstantSearch, { props: instantSearchOptions }, [
        h(AisHierarchicalMenu, { props: { attributes } }),
      ])
    ),
  }).$mount(container);

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});

createMenuTests(async ({ instantSearchOptions, attribute }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vm = new Vue({
    render: renderCompat((h) =>
      h(AisInstantSearch, { props: instantSearchOptions }, [
        h(AisMenu, { props: { attribute } }),
      ])
    ),
  }).$mount(container);

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});

createPaginationTests(async ({ instantSearchOptions }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vm = new Vue({
    render: renderCompat((h) =>
      h(AisInstantSearch, { props: instantSearchOptions }, [h(AisPagination)])
    ),
  }).$mount(container);

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});
