import React from 'react';
import {
  InstantSearch,
  Breadcrumb,
  HierarchicalMenu,
  ClearRefinements,
  CurrentRefinements,
  ToggleRefinement,
  HitsPerPage,
  Menu,
  Pagination,
  RangeInput,
  RefinementList,
  SearchBox,
  SortBy,
} from 'react-instantsearch-dom';

function App() {
  const [refreshValue] = useState(0);

  return (
    <InstantSearch
      searchState={{}}
      resultsState={{}}
      createURL={() => {}}
      onSearchStateChange={() => {}}
      onSearchParameters={() => {}}
      refresh={refreshValue}
      indexName="instant_search"
    >
      <Breadcrumb rootURL="/truc" translations={{ rootLabel: 'Home' }} />
      <ClearRefinements
        clearsQuery={true}
        translations={{ reset: 'Clear all filters' }}
      />
      <CurrentRefinements clearsQuery={true} />
      <HierarchicalMenu
        defaultRefinement="Cameras & Camcorders"
        attributes={['categories.lvl0', 'categories.lvl1']}
        facetOrdering={false}
        translations={{
          showMore(expanded) {
            return expanded ? 'Show less' : 'Show more';
          },
        }}
      />
      <HitsPerPage
        defaultRefinement={5}
        items={[
          { value: 5, label: 'Show 5 hits' },
          { value: 10, label: 'Show 10 hits' },
        ]}
      />
      <Menu
        defaultRefinement="Audio"
        attribute="category"
        facetOrdering={false}
        translations={{
          showMore(expanded) {
            return expanded ? 'Show less' : 'Show more';
          },
          noResults: 'No results',
        }}
      />
      <Pagination
        defaultRefinement={2}
        translations={{
          previous: '‹',
          next: '›',
          first: '«',
          last: '»',
          page(currentRefinement) {
            return currentRefinement;
          },
          ariaPrevious: 'Previous page',
          ariaNext: 'Next page',
          ariaFirst: 'First page',
          ariaLast: 'Last page',
          ariaPage(currentRefinement) {
            return `Page ${currentRefinement}`;
          },
        }}
      />
      <RangeInput
        defaultRefinement={{ min: 0, max: 500 }}
        attribute="price"
        translations={{
          submit: 'ok',
          separator: 'to',
        }}
      />
      <RefinementList
        defaultRefinement={['Apple', 'Insignia']}
        attribute="brand"
        facetOrdering={false}
        translations={{
          showMore(expanded) {
            return expanded ? 'Show less' : 'Show more';
          },
          noResults: 'No results',
          submitTitle: 'Submit your search query.',
          resetTitle: 'Clear your search query.',
          placeholder: 'Search here...',
        }}
      />
      <SearchBox
        defaultRefinement="iphone"
        focusShortcuts={['s']}
        translations={{
          submitTitle: 'Submit your search query.',
          resetTitle: 'Clear your search query.',
          placeholder: 'Search here...',
        }}
      />
      <SortBy defaultRefinement="instant_search_asc" />
      <ToggleRefinement
        value={true}
        attribute="free_shipping"
        defaultRefinement={true}
      />
      <Hits
        hitComponent={(hit) => (
          <Highlight tagName="span">{JSON.stringify(hit)}</Highlight>
        )}
      />
    </InstantSearch>
  );
}

export default App;
