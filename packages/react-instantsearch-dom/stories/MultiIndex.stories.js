import { storiesOf } from '@storybook/react';
import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import {
  Configure,
  InstantSearch,
  Index,
  Highlight,
  Pagination,
  SearchBox,
  SortBy,
  connectHits,
  connectAutoComplete,
  connectStateResults,
} from 'react-instantsearch-dom';

import { Content as StoryWrapper } from './util';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const Product = ({ hit }) => {
  const image = `https://ecommerce-images.algolia.com/img/produit/nano/${hit.objectID}-1.jpg%3Falgolia`;
  return (
    <div className="multi-index_hit">
      <div>
        <div className="multi-index_hit-picture">
          <img src={`${image}`} />
        </div>
      </div>
      <div className="multi-index_hit-content">
        <div>
          <Highlight attribute="name" hit={hit} />
          <span> - ${hit.price}</span>
        </div>
        <div className="multi-index_hit-description">
          <Highlight attribute="brand" hit={hit} />
        </div>
      </div>
    </div>
  );
};

Product.propTypes = {
  hit: PropTypes.object.isRequired,
};

const CategoryOrBrand = ({ hit }) => (
  <div className="multi-index_hit">
    <Highlight attribute="name" hit={hit} />
  </div>
);

CategoryOrBrand.propTypes = {
  hit: PropTypes.object.isRequired,
};

const CustomCategoriesOrBrands = connectHits(({ hits }) => {
  const categoryOrBrand = hits.map((hit) => (
    <CategoryOrBrand hit={hit} key={hit.objectID} />
  ));
  return <div className="multi-index_hits">{categoryOrBrand}</div>;
});

const CustomProducts = connectHits(({ hits }) => {
  const products = hits.map((hit) => <Product hit={hit} key={hit.objectID} />);
  return <div className="multi-index_hits">{products}</div>;
});

const AutoComplete = connectAutoComplete(
  ({ hits, currentRefinement, refine }) => (
    <Autosuggest
      suggestions={hits}
      multiSection={true}
      onSuggestionsFetchRequested={({ value }) => refine(value)}
      onSuggestionsClearRequested={() => refine('')}
      getSuggestionValue={(hit) => hit.name}
      renderSuggestion={(hit) =>
        hit.brand ? <Product hit={hit} /> : <CategoryOrBrand hit={hit} />
      }
      inputProps={{
        placeholder: 'Search for a category, brand or product',
        value: currentRefinement,
        onChange: () => {},
      }}
      renderSectionTitle={(section) => section.index}
      getSectionSuggestions={(section) => section.hits}
    />
  )
);

const Content = connectStateResults(
  ({ searchState, searchResults, children }) =>
    searchResults && searchResults.nbHits !== 0 ? (
      children
    ) : (
      <div>
        No results has been found for {searchState.query} and index{' '}
        {searchResults ? searchResults.index : ''}
      </div>
    )
);

const Results = connectStateResults(({ allSearchResults, children }) => {
  const noResults =
    allSearchResults &&
    Object.values(allSearchResults).reduce(
      (acc, results) => results.nbHits === 0,
      false
    );
  return noResults ? (
    <div>
      <div>No results in category, products or brand</div>
      <Index indexName="categories" />
      <Index indexName="brands" />
      <Index indexName="products" />
    </div>
  ) : (
    children
  );
});

const stories = storiesOf('<Index>', module);

stories
  .add('MultiHits', () => (
    <StoryWrapper linkedStoryGroup="MultiIndex.stories.js">
      <InstantSearch searchClient={searchClient} indexName="instant_search">
        <SearchBox />

        <Index indexName="bestbuy">
          <h3>
            index: <code>bestbuy</code>
          </h3>
          <Configure hitsPerPage={3} />
          <CustomCategoriesOrBrands />
        </Index>

        <Index indexName="instant_search">
          <h3>
            index: <code>instant_search</code>
          </h3>
          <Configure hitsPerPage={3} />
          <CustomCategoriesOrBrands />
        </Index>

        <Index indexId="instant_search_apple" indexName="instant_search">
          <h3>
            index: <code>instant_search</code> with <code>brand:Apple</code>
          </h3>
          <Configure hitsPerPage={3} filters="brand:Apple" />
          <CustomCategoriesOrBrands />
        </Index>

        <Index indexId="instant_search_samsung" indexName="instant_search">
          <h3>
            index: <code>instant_search</code> with <code>brand:Samsung</code>
          </h3>
          <Configure hitsPerPage={3} filters="brand:Samsung" />
          <CustomCategoriesOrBrands />
        </Index>

        <Index indexId="instant_search_microsoft" indexName="instant_search">
          <h3>
            index: <code>instant_search</code> with <code>brand:Microsoft</code>
          </h3>
          <Configure hitsPerPage={3} filters="brand:Microsoft" />
          <CustomCategoriesOrBrands />
        </Index>
      </InstantSearch>
    </StoryWrapper>
  ))
  .add('AutoComplete', () => (
    <StoryWrapper linkedStoryGroup="MultiIndex.stories.js">
      <InstantSearch searchClient={searchClient} indexName="categories">
        <Configure hitsPerPage={3} />
        <Index indexName="brands" />
        <Index indexName="products">
          <Configure hitsPerPage={5} />
        </Index>
        <AutoComplete />
      </InstantSearch>
    </StoryWrapper>
  ))
  .add('with SortBy nested in same Index as Root', () => (
    <StoryWrapper linkedStoryGroup="MultiIndex.stories.js">
      <InstantSearch searchClient={searchClient} indexName="categories">
        <SearchBox />

        <div className="multi-index_content">
          <div className="multi-index_categories-or-brands">
            <Index indexName="categories">
              <Configure hitsPerPage={3} />

              <SortBy
                defaultRefinement="categories"
                items={[
                  { value: 'categories', label: 'Categories' },
                  { value: 'bestbuy', label: 'Best buy' },
                ]}
              />

              <CustomCategoriesOrBrands />
            </Index>

            <Index indexName="products">
              <Configure hitsPerPage={3} />

              <SortBy
                defaultRefinement="products"
                items={[
                  { value: 'products', label: 'Products' },
                  { value: 'brands', label: 'Brands' },
                ]}
              />

              <CustomCategoriesOrBrands />
            </Index>
          </div>
        </div>
      </InstantSearch>
    </StoryWrapper>
  ))
  .add('with conditional rendering', () => (
    <StoryWrapper linkedStoryGroup="MultiIndex.stories.js">
      <InstantSearch searchClient={searchClient} indexName="categories">
        <SearchBox />
        <Results>
          <div className="multi-index_content">
            <div className="multi-index_categories-or-brands">
              <Index indexName="categories">
                <Content>
                  <div>
                    <div>Categories: </div>
                    <Configure hitsPerPage={3} />
                    <CustomCategoriesOrBrands />
                  </div>
                </Content>
              </Index>
              <Index indexName="brands">
                <Content>
                  <div>
                    <div>Brand: </div>
                    <Configure hitsPerPage={3} />
                    <CustomCategoriesOrBrands />
                  </div>
                </Content>
              </Index>
            </div>
            <div className="multi-index_products">
              <Index indexName="products">
                <Content>
                  <div>
                    <div>Products: </div>
                    <Configure hitsPerPage={5} />
                    <CustomProducts />
                  </div>
                </Content>
              </Index>
            </div>
          </div>
        </Results>
      </InstantSearch>
    </StoryWrapper>
  ))
  .add('with Hits & Configure', () => (
    <StoryWrapper linkedStoryGroup="MultiIndex.stories.js">
      <InstantSearch searchClient={searchClient} indexName="brands">
        <Configure hitsPerPage={5} />
        <SearchBox />

        <CustomCategoriesOrBrands />
        <Pagination />

        <Index indexName="products">
          <CustomProducts />
          <Pagination />
        </Index>
      </InstantSearch>
    </StoryWrapper>
  ));
