import { compositionClient } from '@algolia/composition';
import React, { useState } from 'react';
import {
  Configure,
  Feeds,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  Highlight,
  useFeeds,
} from 'react-instantsearch';

import getRouting from './routing';

import 'instantsearch.css/themes/reset.css';

import './Theme.css';
import './App.css';

import type { Hit as AlgoliaHit } from 'instantsearch.js';

const searchClient = compositionClient(
  '9HILZG6EJK',
  '65b3e0bb064c4172c4810fb2459bebd1'
);

const multifeedCompositionID = 'comp1774447423386___products';
const compositionID = multifeedCompositionID;
const routing = getRouting(compositionID);

export function App() {
  return (
    <InstantSearch
      // @ts-expect-error compositionClient return type doesn't fully match SearchClient yet
      searchClient={searchClient}
      compositionID={compositionID}
      routing={routing}
      insights={true}
    >
      <Configure hitsPerPage={20} />

      <header className="header">
        <p className="header-title">Stop looking for an item — find it.</p>
        <SearchBox placeholder="Product, brand, color, …" />
      </header>

      <main className="container">
        <section className="container-results">
          <TabbedFeeds />

          <footer className="container-footer">
            <Pagination padding={2} showFirst={false} showLast={false} />
          </footer>
        </section>
      </main>
    </InstantSearch>
  );
}

function TabbedFeeds() {
  const { feedIDs } = useFeeds({ searchScope: 'global' });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const current = activeTab ?? feedIDs[0] ?? null;

  return (
    <>
      {feedIDs.length > 0 && (
        <div className="feeds-tabs">
          {feedIDs.map((id) => (
            <button
              key={id}
              className={`feeds-tabs-btn${id === current ? ' feeds-tabs-active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {id || 'All results'}
            </button>
          ))}
        </div>
      )}

      <Feeds
        searchScope="global"
        renderFeed={({ feedID }) => (
          <div style={{ display: feedID === current ? undefined : 'none' }}>
            <FeedHits feedID={feedID} />
          </div>
        )}
      />
    </>
  );
}

function FeedHits({ feedID }: { feedID: string }) {
  switch (feedID) {
    case 'products':
      return <Hits hitComponent={ProductHit} />;
    case 'Fashion':
      return <Hits hitComponent={FashionHit} />;
    case 'Amazon':
      return <Hits hitComponent={AmazonHit} />;
    default:
      return <Hits hitComponent={ProductHit} />;
  }
}

function ProductHit({ hit }: { hit: AlgoliaHit<{ title: string; author: string[]; largeImage: string }> }) {
  return (
    <article className="hit">
      <header className="hit-image-container">
        <img src={hit.largeImage} alt={hit.title} className="hit-image" />
      </header>
      <div className="hit-info-container">
        <h1><Highlight attribute="title" highlightedTagName="mark" hit={hit} /></h1>
        <p className="hit-description">{hit.author?.join(', ')}</p>
      </div>
    </article>
  );
}

function FashionHit({ hit }: { hit: AlgoliaHit<{ name: string; image: string; brand: string; price: number; currency: string }> }) {
  return (
    <article className="hit">
      <header className="hit-image-container">
        <img src={hit.image} alt={hit.name} className="hit-image" />
      </header>
      <div className="hit-info-container">
        <p className="hit-category">{hit.brand}</p>
        <h1><Highlight attribute="name" highlightedTagName="mark" hit={hit} /></h1>
        <p className="hit-description">{hit.price} {hit.currency}</p>
      </div>
    </article>
  );
}

function AmazonHit({ hit }: { hit: AlgoliaHit<{ product_title: string; product_brand: string }> }) {
  return (
    <article className="hit">
      <div className="hit-info-container">
        <p className="hit-category">{hit.product_brand}</p>
        <h1><Highlight attribute="product_title" highlightedTagName="mark" hit={hit} /></h1>
      </div>
    </article>
  );
}
