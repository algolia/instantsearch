import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React from 'react';
import { Autocomplete, InstantSearch } from 'react-instantsearch';

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
          <div className="search-panel">
            <div className="search-panel__results">
              <Autocomplete />
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}
