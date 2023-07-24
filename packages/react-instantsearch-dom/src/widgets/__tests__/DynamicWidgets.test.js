/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import {
  DynamicWidgets as CoreDynamicWidgets,
  InstantSearch,
} from 'react-instantsearch-core';

import DynamicWidgets from '../DynamicWidgets';

jest.mock('react-instantsearch-core', () => {
  const original = jest.requireActual('react-instantsearch-core');
  return {
    ...original,
    DynamicWidgets: jest.fn(() => null),
  };
});

const EMPTY_RESPONSE = {
  results: [
    {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      exhaustiveNbHits: true,
      query: '',
      queryAfterRemoval: '',
      params:
        'highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&query=&facets=%5B%5D&tagFilters=',
      index: 'instant_search',
      processingTimeMS: 2,
    },
  ],
};

const createSearchClient = () => ({
  search: jest.fn(() => Promise.resolve(EMPTY_RESPONSE)),
  searchForFacetValues: jest.fn(() => Promise.resolve({})),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DynamicWidgets', () => {
  it('sets a className', () => {
    const searchClient = createSearchClient();

    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="test">
        <DynamicWidgets></DynamicWidgets>
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-DynamicWidgets"
        />
      </div>
    `);
  });

  it('allows a custom className', () => {
    const searchClient = createSearchClient();

    const { container } = render(
      <InstantSearch searchClient={searchClient} indexName="test">
        <DynamicWidgets className="extra"></DynamicWidgets>
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-DynamicWidgets extra"
        />
      </div>
    `);
  });

  it('forwards props to core widget', () => {
    const searchClient = createSearchClient();

    const children = [<div key={1}>testing</div>, <div key={2}>testing2</div>];

    const transformItems = () => {};

    render(
      <InstantSearch searchClient={searchClient} indexName="test">
        <DynamicWidgets
          className="extra"
          transformItems={transformItems}
          unknownOption
        >
          {children}
        </DynamicWidgets>
      </InstantSearch>
    );

    expect(CoreDynamicWidgets).toHaveBeenCalledTimes(1);
    expect(CoreDynamicWidgets).toHaveBeenCalledWith(
      { children, transformItems, unknownOption: true },
      {}
    );
  });
});
