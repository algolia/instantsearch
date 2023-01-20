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
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([hierarchicalMenu({ container, ...widgetParams })])
    .start();

  return { container };
});

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([refinementList({ container, ...widgetParams })])
    .start();

  return { container };
});

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([menu({ container, ...widgetParams })])
    .start();

  return { container };
});

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([pagination({ container, ...widgetParams })])
    .start();

  return { container };
});
