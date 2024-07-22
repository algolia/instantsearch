// @ts-nocheck
import { HorizontalSlider } from '@algolia/ui-components-horizontal-slider-react';
import algoliasearch from 'algoliasearch/lite';
import { createCarouselComponent } from 'instantsearch-ui-components';
import { Hit } from 'instantsearch.js';
import React, { createElement, Fragment, useRef } from 'react';
import {
  Configure,
  InstantSearch,
  SearchBox,
  TrendingItemsProps,
  useTrendingItems,
} from 'react-instantsearch';

import '@algolia/ui-components-horizontal-slider-theme/dist/theme.css';
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
            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <CustomTrendingItems itemComponent={ItemComponent} limit={8} />
            </div>
          </div>
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

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article>
      <div>
        <img src={item.image} />
        <p>{item.name}</p>
      </div>
      <a href={`/products.html?pid=${item.objectID}`}>See product</a>
    </article>
  );
}

function CustomTrendingItems({
  facetName,
  facetValue,
  limit,
  threshold,
  fallbackParameters,
  queryParameters,
  escapeHTML,
  transformItems,
  itemComponent,
  ...props
}: TrendingItemsProps<HitType>) {
  const Carousel = createCarouselComponent({
    createElement,
    Fragment,
    useRef,
  });

  const { items } = useTrendingItems({
    facetName,
    facetValue,
    limit,
    threshold,
    fallbackParameters,
    queryParameters,
    escapeHTML,
    transformItems,
  });

  return (
    <div>
      <h2>HorizontalSlider</h2>
      <HorizontalSlider items={items} itemComponent={itemComponent} />
      <h2>Carousel</h2>
      <Carousel items={items} itemComponent={itemComponent} {...props} />
    </div>
  );
}
