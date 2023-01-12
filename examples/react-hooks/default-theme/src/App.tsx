import { Hit as AlgoliaHit } from 'instantsearch.js';
import algoliasearch from 'algoliasearch/lite';
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
} from 'react-instantsearch-hooks-web';

import {
  Panel,
  QueryRuleContext,
  QueryRuleCustomData,
  Refresh,
} from './components';
import { Tab, Tabs } from './components/layout';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);
const search = searchClient.search;
searchClient.search = async (queries) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return search(queries);
};

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

const attributes = ['brand', 'price', 'categories'];

export function App() {
  const [count, setCount] = React.useState(1);
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      routing={true}
    >
      <Configure ruleContexts={[]} />

      <div className="Container">
        <div>
          <button onClick={() => setCount(count + 1)}>add</button>
          {Array.from({ length: count }).map((_, i) => (
            <Panel header={attributes[i]} key={i}>
              <RefinementList attribute={attributes[i]} />
            </Panel>
          ))}
          <Panel header="hierarchy">
            <HierarchicalMenu
              attributes={[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]}
            />
          </Panel>
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
