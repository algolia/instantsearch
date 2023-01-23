import { Hit as AlgoliaHit } from 'instantsearch.js';
import algoliasearch from 'algoliasearch/lite';
import React, { createElement } from 'react';
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
  useHits,
  useInstantSearch,
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

export function App() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      routing={true}
    >
      <Configure ruleContexts={[]} clickAnalytics={true} />

      <div className="Container">
        <div>
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
              <RangeInput attribute="price" />
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
              {/* <Hits hitComponent={Hit} /> */}
              {/* <CustomHitsWithProps /> */}
              <CustomHitsWithWrapper />
              <Pagination className="Pagination" />
            </Tab>
            {/* <Tab title="InfiniteHits">
              <InfiniteHits showPrevious hitComponent={Hit} />
            </Tab> */}
          </Tabs>
        </div>
      </div>
    </InstantSearch>
  );
}

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

function CustomHitsWithProps() {
  const { hits, getHitProps, sendEvent } = useHits();

  return (
    <ul>
      {hits.map((hit) => {
        const hitProps = getHitProps({ hit });
        return (
          <li
            key={hit.objectID}
            {...hitProps}
            onClick={(e) => {
              hitProps.onClick(e);
              sendEvent('click', hit, 'CustomHitsWithProps: Hit Clicked');
              sendEvent(
                'conversion',
                hit,
                'CustomHitsWithProps: Hit Added to Cart'
              );
            }}
          >
            {hit.name}
          </li>
        );
      })}
    </ul>
  );
}

function CustomHitsWithWrapper() {
  const { hits, HitWrapper, sendEvent } = useHits();

  return (
    <ul>
      {hits.map((hit) => (
        <HitWrapper key={hit.objectID} hit={hit}>
          <li>
            {hit.name}
            <button
              onClick={() => {
                sendEvent('click', hit, 'CustomHitsWithWrapper: Hit clicked');
              }}
            >
              Click me
            </button>
            <button
              onClick={() =>
                console.log('will bubble to default event handler')
              }
            >
              This won't trigger event
            </button>
          </li>
        </HitWrapper>
      ))}
    </ul>
  );
}
