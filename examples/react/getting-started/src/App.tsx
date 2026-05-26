import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React, { useRef } from 'react';
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
  Chat,
  ChatPageSuggestions,
  ChatPageSummary,
  FilterSuggestions,
  CurrentRefinements,
} from 'react-instantsearch';
import { useInstantSearch } from 'react-instantsearch-core';

import { Panel } from './Panel';

import type { Hit } from 'instantsearch.js';

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
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          insights={true}
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
              <Panel header="categories">
                <RefinementList attribute="categories" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" aiMode />
              <Panel
                header="Current Refinements"
                hidden={(state) =>
                  state.currentRefinements?.items?.length === 0
                }
              >
                <CurrentRefinements />
              </Panel>
              <Panel header="Filter Suggestions">
                <FilterSuggestions
                  agentId="3123062d-d611-4d4f-8ab2-4fa39302dc64"
                  attributes={['brand', 'categories']}
                  headerComponent={false}
                />
              </Panel>
              {/* <Panel header="Page suggestion (POC)">
                <PageSuggestions />
              </Panel> */}
              <Panel header="Prompt pills (POC)">
                <ChatPageSuggestions
                  maxSuggestions={4}
                  transport={{ api: '/api/chat-page-suggestions?delay=3000' }}
                />
              </Panel>
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

          <Chat
            agentId="eedef238-5468-470d-bc37-f99fa741bd25"
            feedback={true}
            itemComponent={ItemComponent}
          />
        </InstantSearch>
      </div>
    </div>
  );
}

type HitType = Hit<{
  image: string;
  name: string;
  description: string;
}>;

function PageSuggestions() {
  const { uiState } = useInstantSearch();
  const query = uiState.instant_search?.query || '';

  // Latest uiState lives in a ref so the context getter (and the prompt) keep
  // stable references across renders. Passing fresh function/string refs would
  // make `useStableValue` in `useConnector` consider the widget props changed
  // every time InstantSearch emits a `render` event, which would tear down and
  // re-instantiate the widget — including its underlying Chat instance — on
  // every render. When the main chat fires a tool call after the handoff, that
  // would loop forever and freeze the page.
  const latestRef = useRef({ query, refinements: {} as Record<string, any> });
  latestRef.current = {
    query,
    refinements: uiState.instant_search?.refinementList || {},
  };

  const stableContextRef = useRef(() => ({}));
  const stablePromptRef = useRef('give me some tvs');

  return (
    <div
      style={{
        border: '1px dashed #888',
        padding: 12,
        borderRadius: 4,
        background: '#fafafa',
      }}
    >
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Current query: <strong>{query || '(none)'}</strong>
      </div>
      <ChatPageSummary
        agentId="eedef238-5468-470d-bc37-f99fa741bd25"
        initialUserMessage={stablePromptRef.current}
        context={stableContextRef.current}
        ctaLabel="Continue in chat"
        itemComponent={({ item }) => (
          <article className="ais-Carousel-hit">
            <div className="ais-Carousel-hit-image">
              <img src={(item as any).image} alt={(item as any).name} />
            </div>
            <h2 className="ais-Carousel-hit-title">{(item as any).name}</h2>
          </article>
        )}
      />
    </div>
  );
}

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <h1>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article className="ais-Carousel-hit">
      <div className="ais-Carousel-hit-image">
        <img src={item.image} />
      </div>
      <h2 className="ais-Carousel-hit-title">
        <a
          href={`/products.html?pid=${item.objectID}`}
          className="ais-Carousel-hit-link"
        >
          {item.name}
        </a>
      </h2>
    </article>
  );
}
