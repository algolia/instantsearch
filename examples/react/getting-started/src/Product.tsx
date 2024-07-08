import { liteClient as algoliasearch } from 'algoliasearch-v5/lite';
import { type Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Hits,
  InstantSearch,
  RelatedProducts,
} from 'react-instantsearch';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export function Product({ pid }: { pid: string }) {
  return (
    <>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Getting started</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <a href="/">← Back to search</a>
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          insights={true}
        >
          <Configure hitsPerPage={1} filters={`objectID:${pid}`} />
          <Hits
            hitComponent={HitComponent}
            classNames={{
              root: 'ais-Hits--single',
            }}
          />
          <RelatedProducts
            itemComponent={ItemComponent}
            emptyComponent={() => <></>}
            objectIDs={[pid]}
            limit={4}
          />
        </InstantSearch>
      </div>
    </>
  );
}

type HitType = Hit<{
  image: string;
  name: string;
  description: string;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <img src={hit.image} />
      <div>
        <h1>{hit.name}</h1>
        <p>{hit.description}</p>
      </div>
    </article>
  );
}

function ItemComponent({ item }: { item: HitType }) {
  return (
    <article>
      <div>
        <img src={item.image} />
        <h2>{item.name}</h2>
      </div>
      <a href={`/products.html?pid=${item.objectID}`}>See product</a>
    </article>
  );
}
