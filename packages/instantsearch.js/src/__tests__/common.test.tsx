/**
 * @jest-environment jsdom
 */
import {
  createHierarchicalMenuTests,
  createRefinementListTests,
  createPaginationTests,
  createMenuTests,
} from '@instantsearch/tests';
import instantsearch from '../index.es';
import { hierarchicalMenu, menu, refinementList, pagination } from '../widgets';

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
