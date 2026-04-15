'use client';

import { useState } from 'react';
import {
  Configure,
  Feeds,
  Highlight,
  Hits,
  Pagination,
  SearchBox,
  useFeeds,
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import { Panel } from '../components/Panel';
import { client } from '../lib/client';

import type { Hit as AlgoliaHit } from 'instantsearch.js';

const compositionID = 'comp1774447423386___products';

export default function Search() {
  return (
    <InstantSearchNext
      // @ts-expect-error compositionClient return type doesn't fully match SearchClient yet
      searchClient={client}
      compositionID={compositionID}
      routing
      insights={true}
    >
      <Configure hitsPerPage={20} />

      <div className="Container">
        <div>
          <Panel header="Search">
            <SearchBox placeholder="Product, brand, color, …" />
          </Panel>
        </div>

        <div>
          <TabbedFeeds />

          <Pagination padding={2} showFirst={false} showLast={false} />
        </div>
      </div>
    </InstantSearchNext>
  );
}

function TabbedFeeds() {
  const { feedIDs } = useFeeds({ searchScope: 'global' });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const current = activeTab ?? feedIDs[0] ?? null;

  return (
    <>
      {feedIDs.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {feedIDs.map((id) => (
            <button
              key={id}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: id === current ? '#5468ff' : '#fff',
                color: id === current ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: id === current ? 'bold' : 'normal',
              }}
              onClick={() => setActiveTab(id)}
            >
              {id || 'All results'}
            </button>
          ))}
        </div>
      )}

      <Feeds searchScope="global">
        {(feedID) => (
          <div style={{ display: feedID === current ? undefined : 'none' }}>
            <FeedHits feedID={feedID} />
          </div>
        )}
      </Feeds>
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

type ProductHitType = AlgoliaHit<{
  title: string;
  author: string[];
  largeImage: string;
}>;

function ProductHit({ hit }: { hit: ProductHitType }) {
  return (
    <article className="hit">
      <header className="hit-image-container">
        <img src={hit.largeImage} alt={hit.title} className="hit-image" />
      </header>
      <div className="hit-info-container">
        <p className="hit-category">{hit.author?.join(', ')}</p>
        <h1>
          <Highlight attribute="title" highlightedTagName="mark" hit={hit} />
        </h1>
      </div>
    </article>
  );
}

type FashionHitType = AlgoliaHit<{
  name: string;
  image: string;
  brand: string;
  price: number;
  currency: string;
}>;

function FashionHit({ hit }: { hit: FashionHitType }) {
  return (
    <article className="hit">
      <header className="hit-image-container">
        <img src={hit.image} alt={hit.name} className="hit-image" />
      </header>
      <div className="hit-info-container">
        <p className="hit-category">{hit.brand}</p>
        <h1>
          <Highlight attribute="name" highlightedTagName="mark" hit={hit} />
        </h1>
        <p className="hit-description">
          {hit.price} {hit.currency}
        </p>
      </div>
    </article>
  );
}

type AmazonHitType = AlgoliaHit<{
  product_title: string;
  product_brand: string;
}>;

function AmazonHit({ hit }: { hit: AmazonHitType }) {
  return (
    <article className="hit">
      <div className="hit-info-container">
        <p className="hit-category">{hit.product_brand}</p>
        <h1>
          <Highlight
            attribute="product_title"
            highlightedTagName="mark"
            hit={hit}
          />
        </h1>
      </div>
    </article>
  );
}
