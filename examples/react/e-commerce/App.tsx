import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React, { useRef } from 'react';
import {
  Configure,
  HierarchicalMenu,
  Hits,
  HitsPerPage,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  SortBy,
  ToggleRefinement,
  Highlight,
  Snippet,
} from 'react-instantsearch';
import { Chat } from 'react-instantsearch/src';

import {
  AlgoliaSvg,
  ClearFilters,
  ClearFiltersMobile,
  NoResults,
  NoResultsBoundary,
  Panel,
  PriceSlider,
  Ratings,
  ResultsNumberMobile,
  SaveFiltersMobile,
} from './components';
import { ScrollTo } from './components/ScrollTo';
import getRouting from './routing';
import { formatNumber } from './utils';

import 'instantsearch.css/themes/satellite.css';

import './Theme.css';
import './App.css';
import './components/Pagination.css';
import './App.mobile.css';

import type { Hit as AlgoliaHit } from 'instantsearch.js';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const indexName = 'instant_search';
const routing = getRouting(indexName);

export function App() {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef(null);

  function openFilters() {
    document.body.classList.add('filtering');
    window.scrollTo(0, 0);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('click', onClick);
  }

  function closeFilters() {
    document.body.classList.remove('filtering');
    containerRef.current!.scrollIntoView();
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('click', onClick);
  }

  function onKeyUp(event: { key: string }) {
    if (event.key !== 'Escape') {
      return;
    }

    closeFilters();
  }

  function onClick(event: MouseEvent) {
    if (event.target !== headerRef.current) {
      return;
    }

    closeFilters();
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={routing}
      insights={true}
    >
      <Chat agentId="61a4839d-3caf-4258-bc77-32c790fa0be9" />
      <header className="header" ref={headerRef}>
        <p className="header-logo">
          <AlgoliaSvg />
        </p>

        <p className="header-title">Stop looking for an item — find it.</p>

        <SearchBox
          placeholder="Product, brand, color, …"
          submitIconComponent={SubmitIcon}
        />
      </header>

      <Configure
        attributesToSnippet={['description:10']}
        snippetEllipsisText="…"
        removeWordsIfNoResults="allOptional"
      />

      <ScrollTo>
        <main className="container" ref={containerRef}>
          <div className="container-wrapper">
            <section className="container-filters" onKeyUp={onKeyUp}>
              <div className="container-header">
                <h2>Filters</h2>

                <div className="clear-filters" data-layout="desktop">
                  <ClearFilters />
                </div>

                <div className="clear-filters" data-layout="mobile">
                  <ResultsNumberMobile />
                </div>
              </div>

              <div className="container-body">
                <Panel header="Category">
                  <HierarchicalMenu
                    attributes={[
                      'hierarchicalCategories.lvl0',
                      'hierarchicalCategories.lvl1',
                    ]}
                  />
                </Panel>

                <Panel header="Brands">
                  <RefinementList
                    attribute="brand"
                    searchable={true}
                    searchablePlaceholder="Search for brands…"
                  />
                </Panel>

                <Panel header="Price">
                  <PriceSlider attribute="price" />
                </Panel>

                <Panel header="Free shipping">
                  <ToggleRefinement
                    attribute="free_shipping"
                    label="Display only items with free shipping"
                    on={true}
                  />
                </Panel>

                <Panel header="Ratings">
                  <Ratings attribute="rating" />
                </Panel>
              </div>
            </section>

            <footer className="container-filters-footer" data-layout="mobile">
              <div className="container-filters-footer-button-wrapper">
                <ClearFiltersMobile containerRef={containerRef} />
              </div>

              <div className="container-filters-footer-button-wrapper">
                <SaveFiltersMobile onClick={closeFilters} />
              </div>
            </footer>
          </div>

          <section className="container-results">
            <header className="container-header container-options">
              <SortBy
                className="container-option"
                items={[
                  {
                    label: 'Sort by featured',
                    value: 'instant_search',
                  },
                  {
                    label: 'Price ascending',
                    value: 'instant_search_price_asc',
                  },
                  {
                    label: 'Price descending',
                    value: 'instant_search_price_desc',
                  },
                ]}
              />

              <HitsPerPage
                className="container-option"
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
            </header>

            <NoResultsBoundary fallback={<NoResults />}>
              <Hits hitComponent={Hit} />
            </NoResultsBoundary>

            <footer className="container-footer">
              <Pagination padding={2} showFirst={false} showLast={false} />
            </footer>
          </section>
        </main>
      </ScrollTo>

      <aside data-layout="mobile">
        <button
          className="filters-button"
          data-action="open-overlay"
          onClick={openFilters}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 14">
            <path
              d="M15 1H1l5.6 6.3v4.37L9.4 13V7.3z"
              stroke="#fff"
              strokeWidth="1.29"
              fill="none"
              fillRule="evenodd"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Filters
        </button>
      </aside>
    </InstantSearch>
  );
}

function SubmitIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.67"
        transform="translate(1 1)"
      >
        <circle cx="7.11" cy="7.11" r="7.11" />
        <path d="M16 16l-3.87-3.87" />
      </g>
    </svg>
  );
}

type HitType = AlgoliaHit<{
  image: string;
  name: string;
  categories: string[];
  description: string;
  price: number;
  rating: string;
}>;

function Hit({ hit }: { hit: HitType }) {
  return (
    <article className="hit">
      <header className="hit-image-container">
        <img src={hit.image} alt={hit.name} className="hit-image" />
      </header>

      <div className="hit-info-container">
        <p className="hit-category">{hit.categories[0]}</p>
        <h1>
          <Highlight attribute="name" highlightedTagName="mark" hit={hit} />
        </h1>
        <p className="hit-description">
          <Snippet
            attribute="description"
            highlightedTagName="mark"
            hit={hit}
          />
        </p>

        <footer>
          <p>
            <span className="hit-em">$</span>{' '}
            <strong>{formatNumber(hit.price)}</strong>{' '}
            <span className="hit-em hit-rating">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="8"
                viewBox="0 0 16 16"
              >
                <path
                  fill="#e2a400"
                  fillRule="evenodd"
                  d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"
                />
              </svg>{' '}
              {hit.rating}
            </span>
          </p>
        </footer>
      </div>
    </article>
  );
}
