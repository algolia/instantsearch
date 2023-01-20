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

createRefinementListTests(async ({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisRefinementList, { props: widgetParams }),
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

createHierarchicalMenuTests(async ({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisHierarchicalMenu, { props: widgetParams }),
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

createMenuTests(async ({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisMenu, { props: widgetParams }),
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

createPaginationTests(async ({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  const vm = mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(AisPagination, { props: widgetParams }),
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
