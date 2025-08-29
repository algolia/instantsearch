import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import React from 'react';
import {
  InstantSearch,
  Breadcrumb,
  Configure,
  ClearRefinements,
  CurrentRefinements,
  DynamicWidgets,
  HierarchicalMenu,
  Highlight,
  Hits,
  HitsPerPage,
  InfiniteHits,
  Menu,
  Pagination,
  RangeInput,
  RefinementList,
  PoweredBy,
  SearchBox,
  SortBy,
  ToggleRefinement,
  Chat,
} from 'react-instantsearch';

import {
  Panel,
  QueryRuleContext,
  QueryRuleCustomData,
  Refresh,
} from './components';
import { Tab, Tabs } from './components/layout';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="name" className="Hit-label" />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

async function getToken() {
  const response = await fetch(`https://askai.algolia.com/chat/token`, {
    method: 'POST',
    headers: {
      'X-Algolia-Assistant-Id': 'askAIDemo',
    },
  });
  const data = await response.json();
  return data.token;
}

function ChatWithToken() {
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    getToken().then((newToken) => {
      setToken(newToken);
    });
  }, []);

  if (!token) {
    return null;
  }

  return (
    <Chat
      api="https://askai.algolia.com/chat"
      headers={{
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': 'PMZUYBQDAK',
        'X-Algolia-API-Key': '24b09689d5b4223813d9b8e48563c8f6',
        'X-Algolia-Index-Name': 'docsearch-markdown',
        'X-Algolia-Assistant-Id': 'askAIDemo',
        Authorization: `TOKEN ${token}`,
      }}
    />
  );
}

export function App() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      routing={true}
      insights={true}
    >
      <Configure ruleContexts={[]} />

      <div className="Container">
        <div>
          <ChatWithToken />
          <DynamicWidgets>
            <Panel header="Brands">
              <RefinementList
                attribute="brand"
                searchable={true}
                searchablePlaceholder="Search brands"
                showMore={true}
              />
            </Panel>
            <Panel header="Categories">
              <Menu attribute="categories" showMore={true} />
            </Panel>
            <Panel header="Hierarchy">
              <HierarchicalMenu
                attributes={[
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                  'hierarchicalCategories.lvl2',
                ]}
                showMore={true}
              />
            </Panel>
            <Panel header="Price">
              <RangeInput attribute="price" precision={1} />
            </Panel>
            <Panel header="Free Shipping">
              <ToggleRefinement
                attribute="free_shipping"
                label="Free shipping"
              />
            </Panel>
          </DynamicWidgets>
        </div>
        <div className="Search">
          <Breadcrumb
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />

          <SearchBox placeholder="Search" autoFocus />

          <div className="Search-header">
            <PoweredBy />
            <HitsPerPage
              items={[
                { label: '20 hits per page', value: 20, default: true },
                { label: '40 hits per page', value: 40 },
              ]}
            />
            <SortBy
              items={[
                { label: 'Relevance', value: 'instant_search' },
                { label: 'Price (asc)', value: 'instant_search_price_asc' },
                { label: 'Price (desc)', value: 'instant_search_price_desc' },
              ]}
            />
            <Refresh />
          </div>

          <div className="CurrentRefinements">
            <ClearRefinements />
            <CurrentRefinements
              transformItems={(items) =>
                items.map((item) => {
                  const label = item.label.startsWith('hierarchicalCategories')
                    ? 'Hierarchy'
                    : item.label;

                  return {
                    ...item,
                    attribute: label,
                  };
                })
              }
            />
          </div>

          <QueryRuleContext
            trackedFilters={{
              brand: () => ['Apple'],
            }}
          />

          <QueryRuleCustomData>
            {({ items }) => (
              <>
                {items.map((item) => (
                  <a href={item.link} key={item.banner}>
                    <img src={item.banner} alt={item.title} />
                  </a>
                ))}
              </>
            )}
          </QueryRuleCustomData>

          <Tabs>
            <Tab title="Hits">
              <Hits hitComponent={Hit} />
              <Pagination className="Pagination" />
            </Tab>
            <Tab title="InfiniteHits">
              <InfiniteHits showPrevious hitComponent={Hit} />
            </Tab>
          </Tabs>
        </div>
      </div>
    </InstantSearch>
  );
}
