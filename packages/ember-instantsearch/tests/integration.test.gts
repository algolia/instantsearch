import { tracked } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import { renderSettled } from '@ember/renderer';
import userEvent from '@testing-library/user-event';
import { connectStats } from 'instantsearch.js/es/connectors/index';
import { refinementList, searchBox } from 'instantsearch.js/es/widgets/index';
import { describe, expect, test } from 'vitest';

import { Highlight, InstantSearch } from 'ember-instantsearch';

import { render } from './-support/render.ts';
import { createSearchClient } from './-support/search-client.ts';

import type { InstantSearch as InstantSearchCore } from 'instantsearch.js';

/**
 * Waits for the searches that InstantSearch scheduled,
 * and for the render that their results cause.
 */
async function searchesSettled() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await renderSettled();
}

function texts(selector: string) {
  return Array.from(document.querySelectorAll(selector), (element) =>
    (element.textContent ?? '').trim()
  );
}

describe('Ember InstantSearch', () => {
  test('the widgets of the first render share one search', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          <ais.Widget @widget={{searchBox}} />
          <ais.Widget
            @widget={{refinementList}}
            @params={{hash attribute="brand"}}
          />
          <ais.Hits as |hit|>
            <Highlight @hit={{hit}} @attribute="name" />
          </ais.Hits>
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products facets=["brand"]',
    ]);
    expect(texts('.ais-Hits-item')).toEqual(['iPhone', 'Galaxy', 'iPad']);

    userEvent.type(document.querySelector('.ais-SearchBox-input')!, 'i');
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products query="i" facets=["brand"]',
    ]);
    expect(texts('.ais-Hits-item')).toEqual(['iPhone', 'iPad']);
    expect(texts('.ais-Highlight-highlighted')).toEqual(['i', 'i']);
    expect(texts('.ais-Highlight-nonHighlighted')).toEqual(['Phone', 'Pad']);
  });

  test('Configure applies its search parameters, and new ones', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    class State {
      @tracked hitsPerPage = 2;
    }

    const state = new State();

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          <ais.Configure
            @searchParameters={{hash hitsPerPage=state.hitsPerPage}}
          />
          <ais.Hits />
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(steps.splice(0)).toEqual(['search products hitsPerPage=2']);
    expect(document.querySelectorAll('.ais-Hits-item')).toHaveLength(2);

    state.hitsPerPage = 1;
    await renderSettled();
    await searchesSettled();

    expect(steps.splice(0)).toEqual(['search products hitsPerPage=1']);
    expect(document.querySelectorAll('.ais-Hits-item')).toHaveLength(1);
  });

  test('new params replace a widget, which keeps its UI state', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    class State {
      @tracked limit = 10;
    }

    const state = new State();

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          <ais.Widget
            @widget={{refinementList}}
            @params={{hash attribute="brand" limit=state.limit}}
          />
        </InstantSearch>
      </template>
    );
    await searchesSettled();
    steps.splice(0);

    document.querySelector<HTMLInputElement>('input[value="Apple"]')!.click();
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products facets=["brand"] facetFilters=[["brand:Apple"]]',
      'search products facets="brand"',
    ]);

    state.limit = 5;
    await renderSettled();
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products facets=["brand"] facetFilters=[["brand:Apple"]]',
      'search products facets="brand"',
    ]);
    expect(
      document.querySelector<HTMLInputElement>('input[value="Apple"]')!.checked
    ).toBe(true);
  });

  test('a widget that leaves takes its search parameters along', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    class State {
      @tracked showBrands = true;
    }

    const state = new State();

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          {{#if state.showBrands}}
            <ais.Widget
            @widget={{refinementList}}
            @params={{hash attribute="brand"}}
          />
          {{/if}}
          <ais.Hits />
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products facets=["brand"]',
    ]);

    state.showBrands = false;
    await renderSettled();
    await searchesSettled();

    expect(steps.splice(0)).toEqual(['search products']);
    expect(document.querySelector('.ais-RefinementList')).toBeNull();
  });

  test('Connector yields the render state of any connector', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          <ais.Widget @widget={{searchBox}} />
          <ais.Connector @connector={{connectStats}} as |stats|>
            <p id="stats">{{stats.nbHits}} results</p>
          </ais.Connector>
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(texts('#stats')).toEqual(['3 results']);

    userEvent.type(document.querySelector('.ais-SearchBox-input')!, 'g');
    await searchesSettled();

    expect(texts('#stats')).toEqual(['1 results']);
  });

  test('Index searches another index for the widgets inside it', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          <ais.Widget @widget={{searchBox}} />
          <ais.Index @indexName="products_by_price" as |byPrice|>
            <byPrice.Configure @searchParameters={{hash hitsPerPage=1}} />
            <byPrice.Hits id="by-price" />
          </ais.Index>
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products',
      'search products_by_price hitsPerPage=1',
    ]);
    expect(document.querySelectorAll('#by-price .ais-Hits-item')).toHaveLength(
      1
    );

    userEvent.type(document.querySelector('.ais-SearchBox-input')!, 'g');
    await searchesSettled();

    expect(steps.splice(0)).toEqual([
      'search products query="g"',
      'search products_by_price query="g" hitsPerPage=1',
    ]);
  });

  test('a new index name applies to the instance', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);

    class State {
      @tracked indexName = 'products';
    }

    const state = new State();

    await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName={{state.indexName}}
          as |ais|
        >
          <ais.Hits />
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(steps.splice(0)).toEqual(['search products']);

    state.indexName = 'products_by_price';
    await renderSettled();
    await searchesSettled();

    expect(steps.splice(0)).toEqual(['search products_by_price']);
  });

  test('InstantSearch stops when it is destroyed, without a last search', async () => {
    const steps: string[] = [];
    const searchClient = createSearchClient(steps);
    let search: InstantSearchCore | undefined;

    const keep = (instance: InstantSearchCore) => {
      search = instance;
    };

    const result = await render(
      <template>
        <InstantSearch
          @searchClient={{searchClient}}
          @indexName="products"
          as |ais|
        >
          {{keep ais.search}}
          <ais.Widget @widget={{searchBox}} />
          <ais.Hits />
        </InstantSearch>
      </template>
    );
    await searchesSettled();

    expect(steps.splice(0)).toEqual(['search products']);
    expect(search?.started).toBe(true);

    result.destroy();
    await searchesSettled();

    expect(steps.splice(0)).toEqual([]);
    expect(search?.started).toBe(false);
  });
});
