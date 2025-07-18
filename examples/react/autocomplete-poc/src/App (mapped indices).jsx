import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React from 'react';
import {
  Configure,
  Highlight,
  InstantSearch,
  RefinementList,
  SearchBox,
} from 'react-instantsearch';

import { AutoComplete, QuerySuggestions } from './AutoComplete';
import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Getting started</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch searchClient={searchClient} indexName="instant_search">
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <AutoComplete
                indices={{
                  instant_search_1: {
                    name: 'instant_search',
                    config: {},
                    template: List,
                  },
                  instant_search_2: {
                    name: 'instant_search',
                    config: {},
                    template: List,
                  },
                  query_suggestions: {
                    config: {},
                    template: QuerySuggestions,
                  },
                }}
                layout={CustomLayout}
              />
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

function CustomLayout({ indices }) {
  const { instant_search_1, instant_search_2, query_suggestions } = indices;

  return (
    <div className="two-column-layout">
      <div className="first-column">
        <instant_search_1.template />
      </div>
      <div className="second-column">
        <instant_search_2.template />
      </div>
      <div className="third-column">
        <query_suggestions.template />
      </div>
    </div>
  );
}

function SearchBoxComponent({ searchBoxProps }) {
  return <SearchBox {...searchBoxProps} />;
}

function HitComponent({ hit }) {
  return (
    <article>
      <h1>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}
