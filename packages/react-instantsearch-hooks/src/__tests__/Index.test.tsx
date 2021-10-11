import { render } from '@testing-library/react';
import React from 'react';

import { createSearchClient } from '../../../../test/mock';
import { IndexContext } from '../IndexContext';
import { InstantSearch } from '../InstantSearch';
import { Index } from '../SearchIndex';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

describe('Index', () => {
  test('renders children', () => {
    const searchClient = createSearchClient();

    const { container } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">Children</Index>
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        Children
      </div>
    `);
  });

  test('provides the parent index', () => {
    const searchClient = createSearchClient();
    let indexContext: IndexWidget | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">
          <IndexContext.Consumer>
            {(context) => {
              indexContext = context;
              return null;
            }}
          </IndexContext.Consumer>
        </Index>
      </InstantSearch>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
    expect(indexContext!.getIndexName()).toEqual('childIndex');
  });

  test('provides the nested parent index', () => {
    const searchClient = createSearchClient();
    let indexContext: IndexWidget | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">
          <Index indexName="subchildIndex">
            <IndexContext.Consumer>
              {(context) => {
                indexContext = context;
                return null;
              }}
            </IndexContext.Consumer>
          </Index>
        </Index>
      </InstantSearch>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
    expect(indexContext!.getIndexName()).toEqual('subchildIndex');
  });
});
