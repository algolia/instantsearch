import { compositionClient } from '@algolia/composition';
import React from 'react';
import {
  Configure,
  EXPERIMENTAL_Autocomplete,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
} from 'react-instantsearch';

import 'instantsearch.css/themes/satellite.css';
import './App.css';

import type { Hit as AlgoliaHit } from 'instantsearch.js';

const searchClient = compositionClient(
  '9HILZG6EJK',
  '65b3e0bb064c4172c4810fb2459bebd1'
);

const compositionID = 'comp1774447423386___products';

type ProductHit = AlgoliaHit<{
  title: string;
  author?: string[];
  largeImage: string;
}>;

type FashionHit = AlgoliaHit<{
  name: string;
  image: string;
  brand: string;
  price: number;
  currency: string;
}>;

type AmazonHit = AlgoliaHit<{
  product_title: string;
  product_brand: string;
}>;

export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Autocomplete multifeed</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch
          // @ts-expect-error compositionClient return type doesn't fully match SearchClient yet
          searchClient={searchClient}
          compositionID={compositionID}
          insights={true}
        >
          <Configure hitsPerPage={8} />

          <main>
            <div className="container-wrapper">
              <div className="search-panel">
                <div className="search-panel__results">
                  <EXPERIMENTAL_Autocomplete
                    placeholder="Search for products"
                    feeds={[
                      {
                        feedID: 'products',
                        headerComponent: () => (
                          <>
                            <span className="ais-AutocompleteIndexHeaderTitle">
                              Products
                            </span>
                            <span className="ais-AutocompleteIndexHeaderLine" />
                          </>
                        ),
                        itemComponent: ({ item, onSelect }) => (
                          <div onClick={onSelect}>
                            {(item as ProductHit).title}
                          </div>
                        ),
                      },
                      {
                        feedID: 'Fashion',
                        headerComponent: () => (
                          <>
                            <span className="ais-AutocompleteIndexHeaderTitle">
                              Fashion
                            </span>
                            <span className="ais-AutocompleteIndexHeaderLine" />
                          </>
                        ),
                        itemComponent: ({ item, onSelect }) => (
                          <div onClick={onSelect}>
                            {(item as FashionHit).name}
                          </div>
                        ),
                      },
                      {
                        feedID: 'Amazon',
                        headerComponent: () => (
                          <>
                            <span className="ais-AutocompleteIndexHeaderTitle">
                              Amazon
                            </span>
                            <span className="ais-AutocompleteIndexHeaderLine" />
                          </>
                        ),
                        itemComponent: ({ item, onSelect }) => (
                          <div onClick={onSelect}>
                            {(item as AmazonHit).product_title}
                          </div>
                        ),
                      },
                    ]}
                    showRecent={{
                      headerComponent: () => (
                        <>
                          <span className="ais-AutocompleteIndexHeaderTitle">
                            Recent Searches
                          </span>
                          <span className="ais-AutocompleteIndexHeaderLine" />
                        </>
                      ),
                    }}
                  />

                  <Hits hitComponent={HitComponent} />

                  <div className="pagination">
                    <Pagination />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </InstantSearch>
      </div>
    </div>
  );
}

function HitComponent({ hit }: { hit: ProductHit }) {
  return (
    <article>
      <h1>
        <Highlight attribute="title" hit={hit} />
      </h1>
      <p>{hit.author?.join(', ')}</p>
    </article>
  );
}
