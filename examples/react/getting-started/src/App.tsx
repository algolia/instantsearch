import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  TrendingItems,
  Carousel,
  Breadcrumb,
  HierarchicalMenu,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'LOEC74WPH7',
  '3b38713a560044da51e7b1e56fac000f'
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
        <InstantSearch
          searchClient={searchClient}
          indexName="pokedex-fr"
          insights={true}
          collection="Gen 1 > Pokémon Souris"
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <HierarchicalMenu />
              </Panel>
            </div>

            <div className="search-panel__results">
              <Breadcrumb style={{ marginBottom: '1rem' }} />
              <SearchBox placeholder="" className="searchbox" />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
              <div>
                <TrendingItems
                  itemComponent={ItemComponent}
                  limit={6}
                  layoutComponent={Carousel}
                />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

type HitType = Hit<{
  category: string;
  name: {
    fr: string;
  };
  pokedex_id: number;
  sprites: {
    regular: string;
  };
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={hit.sprites.regular}
          alt={hit.name.fr}
          style={{ marginRight: '1rem' }}
          width="64"
        />
        <div>
          <h2>
            {/* @ts-ignore */}
            <Highlight attribute="name.fr" hit={hit} /> ({hit.pokedex_id})
          </h2>
          <p>
            <Highlight attribute="category" hit={hit} />
          </p>
        </div>
      </div>
    </article>
  );
}

function ItemComponent({ item }: { item: HitType }) {
  return (
    <div>
      <article>
        <div>
          <img src={item.sprites.regular} />
          <h2>{item.name.fr}</h2>
        </div>
      </article>
    </div>
  );
}
