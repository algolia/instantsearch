'use client';

import { Hit } from 'instantsearch.js';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Configure,
  Highlight,
  Hits,
  Pagination,
  RefinementList,
  HierarchicalMenu,
  RangeInput,
  ToggleRefinement,
  CurrentRefinements,
  ClearRefinements,
  HitsPerPage,
  Breadcrumb,
  Snippet,
  SortBy,
} from 'react-instantsearch';

import { Panel } from '../components/Panel';

const EXPERIMENTAL_Autocomplete = dynamic(
  () =>
    import('react-instantsearch').then((mod) => mod.EXPERIMENTAL_Autocomplete),
  { ssr: false }
);

const PoweredBy = dynamic(
  () => import('react-instantsearch').then((mod) => mod.PoweredBy),
  { ssr: false }
);

export default function Search() {
  return (
    <>
      <Configure hitsPerPage={12} snippetEllipsisText="…" />
      <div className="container two-columns">
        <aside className="left-column">
          <Panel header="categories">
            <HierarchicalMenu
              attributes={[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]}
              showMore
            />
          </Panel>
          <Panel header="brand">
            <RefinementList attribute="brand" showMore />
          </Panel>
          <Panel header="price">
            <RangeInput attribute="price" />
          </Panel>
          <Panel header="Shipping">
            <ToggleRefinement
              attribute="free_shipping"
              label="Free shipping?"
            />
          </Panel>
        </aside>
        <main>
          <Breadcrumb
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
          <EXPERIMENTAL_Autocomplete
            showRecent
            placeholder="Search for products"
            indices={[
              {
                indexName: 'instant_search',
                headerComponent: () => (
                  <>
                    <span className="ais-AutocompleteIndexHeaderTitle">
                      Products
                    </span>
                    <span className="ais-AutocompleteIndexHeaderLine" />
                  </>
                ),
                itemComponent: ({ item, onSelect }) => (
                  <Link
                    href={`/products/${item.objectID}`}
                    onClick={onSelect}
                    className="ais-AutocompleteIndexItem-link"
                  >
                    <div className="ais-AutocompleteIndexItem-imageContainer">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="ais-AutocompleteIndexItem-image"
                      />
                    </div>
                    <div className="ais-AutocompleteIndexItem-content">
                      <span className="ais-AutocompleteIndexItem-name">
                        {item.name}
                      </span>
                      <span className="ais-AutocompleteIndexItem-price">
                        {formatToDollar(item.price)}
                      </span>
                    </div>
                  </Link>
                ),
                getURL: (item) => `/products/${item.objectID}`,
              },
            ]}
            showSuggestions={{
              indexName: 'instant_search_demo_query_suggestions',
              headerComponent: () => (
                <>
                  <span className="ais-AutocompleteIndexHeaderTitle">
                    Suggestions
                  </span>
                  <span className="ais-AutocompleteIndexHeaderLine" />
                </>
              ),
            }}
          />
          <div className="results-toolbar">
            <PoweredBy />
            <div className="results-toolbar-actions">
              <HitsPerPage
                items={[
                  {
                    label: '16 hits per page',
                    value: 16,
                    default: true,
                  },
                  {
                    label: '32 hits per page',
                    value: 32,
                  },
                  {
                    label: '64 hits per page',
                    value: 64,
                  },
                ]}
              />
              <SortBy
                items={[
                  { label: 'Relevance', value: 'instant_search' },
                  { label: 'Price (asc)', value: 'instant_search_price_asc' },
                  { label: 'Price (desc)', value: 'instant_search_price_desc' },
                ]}
              />
            </div>
          </div>
          <div className="refinements-toolbar">
            <ClearRefinements />
            <CurrentRefinements />
          </div>
          <Hits hitComponent={HitComponent} />
          <Pagination />
        </main>
      </div>
    </>
  );
}

function HitComponent({ hit }: { hit: Hit }) {
  return <Item hit={hit} />;
}

function formatToDollar(amount: number, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function Item({ hit }: { hit: Hit }) {
  return (
    <article className="hit">
      <div className="hit-image-container">
        <img src={hit.image} className="hit-image" alt={hit.name} />
      </div>
      <div className="hit-infos">
        <p className="hit-category">{hit.categories?.[0]}</p>
        <h2 className="hit-title">
          <Link href={`/products/${hit.objectID}`} className="hit-link">
            <span aria-hidden className="hit-link-overlay" />
            <Highlight attribute="name" hit={hit} />
          </Link>
        </h2>
        <p className="hit-description">
          <Snippet attribute="description" hit={hit} />
        </p>
        <div className="hit-price">{formatToDollar(hit.price)}</div>
      </div>
    </article>
  );
}
