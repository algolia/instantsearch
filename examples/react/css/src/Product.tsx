import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Hits,
  InstantSearch,
  RelatedProducts,
  Carousel,
} from 'react-instantsearch';

import 'instantsearch.css/themes/algolia.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export function Product({ pid }: { pid: string }) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      insights={true}
    >
      <Configure hitsPerPage={1} filters={`objectID:${pid}`} />
      <div className="container">
        <Hits hitComponent={HitComponent} />
        <RelatedProducts
          itemComponent={ItemComponent}
          emptyComponent={() => <></>}
          objectIDs={[pid]}
          limit={6}
          layoutComponent={Carousel}
        />
      </div>
    </InstantSearch>
  );
}

function HitComponent({ hit }: { hit: Hit }) {
  return (
    <article>
      <img src={hit.image} />
      <h1>{hit.name}</h1>
      <p>{hit.description}</p>
    </article>
  );
}

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article>
      <img src={item.image} />
      <h2>
        <a href={`/products.html?pid=${item.objectID}`}>{item.name}</a>
      </h2>
      <a href={`/products.html?pid=${item.objectID}`}>See product</a>
    </article>
  );
}
