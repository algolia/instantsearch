import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  Index,
  InstantSearch,
  RefinementList,
  SearchBox,
  useHits,
} from 'react-instantsearch';

import { AutoComplete, AutoCompletePanel } from './AutoComplete';
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
                openOnFocus={true}
                insights={true}
                onOpen={() => {}}
              >
                <AutoComplete.SearchBox>
                  <SearchBox />
                </AutoComplete.SearchBox>

                {/* Custom layouts */}
                <AutoComplete.Layout>
                  <div className="two-column-layout">
                    <Index indexName="index1">
                      <Hits hitComponent={HitComponent} />
                    </Index>

                    <Index indexName="index2">
                      <Hits hitComponent={HitComponent} />
                    </Index>
                  </div>
                </AutoComplete.Layout>

                {/* Premade layouts */}
                <AutoComplete.TwoColumnLayout major="index1" minor="index2" />

                <AutoComplete.DefaultLayout
                  querySuggestions={true}
                  recentSearches={true}
                  classNames={{}}
                />
              </AutoComplete>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
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
