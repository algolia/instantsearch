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
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <RefinementList {...widgetParams} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <HierarchicalMenu {...widgetParams} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <Menu {...widgetParams} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <Pagination {...widgetParams} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});
