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
    .start();
});
