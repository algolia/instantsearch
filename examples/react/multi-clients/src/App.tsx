import recommend from '@algolia/recommend';
import algoliasearch from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  FrequentlyBoughtTogether,
  useFrequentlyBoughtTogether,
} from 'react-instantsearch';

import { Panel } from './Panel';

import './App.css';

export function algolia(appID: string, apiKey: string) {
  const searchClient = algoliasearch(appID, apiKey);
  const recommendClient = recommend(appID, apiKey);

  return { searchClient, recommendClient };
}

const client = algolia('XX85YRZZMV', '098f71f9e2267178bdfc08cc986d2999');

function CustomFrequentlyBoughtTogether({
  objectIDs,
}: {
  objectIDs: string[];
}) {
  const { recommendations } = useFrequentlyBoughtTogether({ objectIDs });
  return (
    <ul>
      {recommendations.map((item) => (
        <li key={item.objectID}>{item.objectID}</li>
      ))}
    </ul>
  );
}

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
        <InstantSearch client={client} indexName="test_FLAGSHIP_ECOM_recommend">
          <FrequentlyBoughtTogether
            objectIDs={['M0E20000000EAAK']}
            itemComponent={({ item }) => <span>{item.objectID}</span>}
          />
          <CustomFrequentlyBoughtTogether objectIDs={['M0E20000000E1HU']} />

          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

type HitProps = {
  hit: Hit;
};

function HitComponent({ hit }: HitProps) {
  return (
    <article>
      <h1>
        <Highlight attribute="name" hit={hit} />
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
    </article>
  );
}
