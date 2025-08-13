import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import { compiler } from 'markdown-to-jsx';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  TrendingItems,
  Carousel,
  ChatMessageBase,
} from 'react-instantsearch';
import { Chat } from 'react-instantsearch/src/widgets/Chat/Chat';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '93aba0bf5908533b213d93b2410ded0c'
);

function renderMarkdown(messages: ChatMessageBase[]) {
  return messages.map((message) => {
    if (message.role === 'assistant') {
      return {
        ...message,
        parts: message.parts.map((part) => {
          if (part.type === 'text') {
            return {
              ...part,
              markdown: compiler(part.text, {
                disableParsingRawHTML: true,
              }),
            };
          }
          return part;
        }),
      };
    }
    return message;
  });
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
        <Chat
          agentId="61a4839d-3caf-4258-bc77-32c790fa0be9"
          renderMarkdown={renderMarkdown}
        />
        <InstantSearch
          searchClient={searchClient}
          indexName="products"
          insights={true}
        >
          <Configure hitsPerPage={8} filters="type:book" />
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
  title: string;
  type: string;
  pubYear: number;
  priceDisplay: string;
  isbn: string[];
  binding: string;
  publicationDate: number;
  salesRank: number;
  asin: string;
  author: string[];
  label: string[];
  mediumImage: string;
  price: number;
  detailPageURL: string;
  largeImage: string;
  brand: string[];
  hasImg: boolean;
  smallImage: string;
  formattedPrice: string;
  categories: string[];
  publisher: string;
  freshness: number;
  featured: boolean;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      {hit.mediumImage && (
        <a href={`/products.html?pid=${hit.objectID}`}>
          <img
            src={hit.mediumImage}
            alt={hit.title}
            style={{
              width: 80,
              height: 120,
              objectFit: 'cover',
              borderRadius: '4px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          />
        </a>
      )}
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
          <a
            href={`/products.html?pid=${hit.objectID}`}
            style={{ color: '#333', textDecoration: 'none' }}
          >
            <Highlight attribute="title" hit={hit} />
          </a>
        </h2>
        <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 8 }}>
          <Highlight attribute="type" hit={hit} />
          {hit.author && hit.author.length > 0 && (
            <> &middot; {hit.author.join(', ')}</>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontWeight: 600,
              color: '#1976d2',
              fontSize: '1rem',
            }}
          >
            {hit.price.toPrecision(2)}
          </span>
          {hit.pubYear && (
            <span style={{ marginLeft: 12, color: '#aaa', fontSize: '0.9rem' }}>
              {hit.pubYear}
            </span>
          )}
        </div>
        <a
          href={`/products.html?pid=${hit.objectID}`}
          style={{
            display: 'inline-block',
            marginTop: 4,
            padding: '6px 14px',
            background: '#1976d2',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          See product
        </a>
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
