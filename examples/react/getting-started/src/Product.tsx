import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { type Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Hits,
  InstantSearch,
  RelatedProducts,
  Carousel,
} from 'react-instantsearch';

import './App.css';
import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '93aba0bf5908533b213d93b2410ded0c'
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
          indexName="products"
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
            limit={6}
            layoutComponent={Carousel}
          />
        </InstantSearch>
      </div>
    </>
  );
}

type HitType = Hit<{
  title: string;
  mediumImage: string;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <img src={hit.mediumImage} />
      <div>
        <h1>{hit.title}</h1>
      </div>
    </article>
  );
}

function ItemComponent({ item }: { item: HitType }) {
  return (
    <div>
      <article>
        <div>
          <img src={item.mediumImage} />
          <h2>{item.title}</h2>
        </div>
        <a href={`/products.html?pid=${item.objectID}`}>See product</a>
      </article>
    </div>
  );
}
