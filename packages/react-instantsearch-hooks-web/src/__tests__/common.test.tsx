/**
 * @jest-environment jsdom
 */
import {
  createRefinementListTests,
  createHierarchicalMenuTests,
  createMenuTests,
  createPaginationTests,
} from '@instantsearch/tests';
import { act, render } from '@testing-library/react';
import React from 'react';

import {
  InstantSearch,
  RefinementList,
  HierarchicalMenu,
  Menu,
  Pagination,
} from '..';

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <RefinementList {...widgetParams} />
    </InstantSearch>
  );
}, act);

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <HierarchicalMenu {...widgetParams} />
    </InstantSearch>
  );
}, act);

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <Menu {...widgetParams} />
    </InstantSearch>
  );
}, act);

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <Pagination {...widgetParams} />
    </InstantSearch>
  );
}, act);
