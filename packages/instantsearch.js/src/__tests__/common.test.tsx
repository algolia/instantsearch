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

createHierarchicalMenuTests(({ instantSearchOptions, attributes }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([hierarchicalMenu({ container, attributes })])
    .start();

  return { container };
});

createRefinementListTests(({ instantSearchOptions, attribute }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([refinementList({ container, attribute })])
    .start();

  return { container };
});

createMenuTests(({ instantSearchOptions, attribute }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([menu({ container, attribute })])
    .start();

  return { container };
});

createPaginationTests(({ instantSearchOptions }) => {
  const container = document.body.appendChild(document.createElement('div'));

  instantsearch(instantSearchOptions)
    .addWidgets([pagination({ container })])
    .start();

  return { container };
});
