/**
 * @jest-environment jsdom
 */
import {
  createRefinementListTests,
  createHierarchicalMenuTests,
  createMenuTests,
  createPaginationTests,
} from '@instantsearch/tests';

import { nextTick, mountApp } from '../../test/utils';
import { renderCompat } from '../util/vue-compat';
import {
  AisInstantSearch,
  AisRefinementList,
  AisHierarchicalMenu,
  AisMenu,
  AisPagination,
} from '../instantsearch';
jest.unmock('instantsearch.js/es');

createRefinementListTests(async ({ instantSearchOptions, attribute }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisRefinementList, { props: { attribute } }),
        ])
      ),
    },
    container
  );

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});

createHierarchicalMenuTests(async ({ instantSearchOptions, attributes }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisHierarchicalMenu, { props: { attributes } }),
        ])
      ),
    },
    container
  );

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});

createMenuTests(async ({ instantSearchOptions, attribute }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisMenu, { props: { attribute } }),
        ])
      ),
    },
    container
  );

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});

createPaginationTests(async ({ instantSearchOptions }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [h(AisPagination)])
      ),
    },
    container
  );

  await nextTick();

  return {
    get container() {
      return vm.$el;
    },
  };
});
