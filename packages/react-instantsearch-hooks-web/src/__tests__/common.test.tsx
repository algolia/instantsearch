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

createRefinementListTests(({ instantSearchOptions, attribute }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <RefinementList attribute={attribute} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});

createHierarchicalMenuTests(({ instantSearchOptions, attributes }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <HierarchicalMenu attributes={attributes} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});

createMenuTests(({ instantSearchOptions, attribute }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <Menu attribute={attribute} />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});

createPaginationTests(({ instantSearchOptions }) => {
  const { container } = render(
    <InstantSearch {...instantSearchOptions}>
      <Pagination />
    </InstantSearch>
  );

  return {
    container,
    act,
  };
});
