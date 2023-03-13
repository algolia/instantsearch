/**
 * @jest-environment jsdom
 */
import {
  createRefinementListTests,
  createHierarchicalMenuTests,
  createBreadcrumbTests,
  createMenuTests,
  createPaginationTests,
  createInfiniteHitsTests,
  createRangeInputTests,
} from '@instantsearch/tests';
import { act, render } from '@testing-library/react';
import React from 'react';

import {
  InstantSearch,
  RefinementList,
  HierarchicalMenu,
  Breadcrumb,
  Menu,
  Pagination,
  InfiniteHits,
  SearchBox,
  useInstantSearch,
  RangeInput,
} from '..';

/**
 * prevent rethrowing InstantSearch errors, so tests can be asserted.
 * IRL this isn't needed, as the error doesn't stop execution.
 */
function GlobalErrorSwallower() {
  useInstantSearch({ catchError: true });

  return null;
}

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <RefinementList {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <HierarchicalMenu {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createBreadcrumbTests(({ instantSearchOptions, widgetParams }) => {
  const { transformItems, ...hierarchicalWidgetParams } = widgetParams;
  render(
    <InstantSearch {...instantSearchOptions}>
      <Breadcrumb {...widgetParams} />
      <HierarchicalMenu {...hierarchicalWidgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <Menu {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <Pagination {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createInfiniteHitsTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <SearchBox />
      <InfiniteHits {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createRangeInputTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <RangeInput {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);
