/**
 * @jest-environment jsdom
 */
import {
  createHierarchicalMenuTests,
  createBreadcrumbTests,
  createRefinementListTests,
  createPaginationTests,
  createMenuTests,
  createInfiniteHitsTests,
  createRangeInputTests,
} from '@instantsearch/tests';

import instantsearch from '../index.es';
import {
  hierarchicalMenu,
  breadcrumb,
  menu,
  refinementList,
  pagination,
  infiniteHits,
  searchBox,
  rangeInput,
} from '../widgets';

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      hierarchicalMenu({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createBreadcrumbTests(({ instantSearchOptions, widgetParams }) => {
  const { transformItems, templates, ...hierarchicalWidgetParams } =
    widgetParams;

  instantsearch(instantSearchOptions)
    .addWidgets([
      breadcrumb({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      hierarchicalMenu({
        container: document.body.appendChild(document.createElement('div')),
        ...hierarchicalWidgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      refinementList({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      menu({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      pagination({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createInfiniteHitsTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      searchBox({
        container: document.body.appendChild(document.createElement('div')),
      }),
      infiniteHits({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createRangeInputTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      rangeInput({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});
