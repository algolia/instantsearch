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
} from 'react-instantsearch';

function App() {
  return (
    <InstantSearch
      /* TODO: `searchState` is no longer supported. This is now handled via an `onStateChange` callback.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-searchstate-with-initialuistate */
      searchState={{}}
      /* TODO: `resultsState` is no longer supported, if you used it for server-side rendering, you can follow
      this guide : https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/ */
      resultsState={{}}
      /* TODO: `createURL` should be moved to the `routing` prop.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#move-createurl-in-routing */
      createURL={() => {}}
      /* TODO: `onSearchStateChange` is no longer supported. This is now handled via an `onStateChange` callback.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-onsearchstatechange-with-onstatechange */
      onSearchStateChange={() => {}}
      /* TODO: `onSearchParameters` is no longer supported.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-refresh-prop-with-refresh-from-useinstantsearch */
      onSearchParameters={() => {}}
      /* TODO: `refresh` is no longer a prop on `InstantSearch`. It can now be called programatically via the `refresh` function returned by `useInstantSearch`.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-refresh-prop-with-refresh-from-useinstantsearch */
      refresh={true}
      indexName="instant_search"
    >
      <Breadcrumb rootPath="/truc" translations={{ rootElementText: 'Home' }} />
      <ClearRefinements
        excludedAttributes={[]}
        translations={{ resetButtonText: 'Clear all filters' }}
      />
      <CurrentRefinements excludedAttributes={[]} />
      <HierarchicalMenu
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement="Cameras & Camcorders"
        attributes={['categories.lvl0', 'categories.lvl1']}
        /* TODO: `facetOrdering` is not supported anymore, see the new `sortBy` prop
        there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby */
        facetOrdering={false}
        translations={{
          showMoreButtonText({ isShowingMore: expanded }) {
            return expanded ? 'Show less' : 'Show more';
          },
        }}
      />
      <HitsPerPage
        // TODO: Remove this `defaultRefinement` prop and add `default: true` to the corresponding item in the `items` array prop.
        defaultRefinement={5}
        items={[
          { value: 5, label: 'Show 5 hits' },
          { value: 10, label: 'Show 10 hits' },
        ]}
      />
      <Menu
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement="Audio"
        attribute="category"
        /* TODO: `facetOrdering` is not supported anymore, see the new `sortBy` prop
        there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby */
        facetOrdering={false}
        translations={{
          showMoreButtonText({ isShowingMore: expanded }) {
            return expanded ? 'Show less' : 'Show more';
          },
          noResults: 'No results',
        }}
      />
      <Pagination
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={2}
        translations={{
          previousPageItemText: '‹',
          nextPageItemText: '›',
          firstPageItemText: '«',
          lastPageItemText: '»',
          pageItemText({ currentPage: currentRefinement }) {
            return currentRefinement;
          },
          previousPageItemAriaLabel: 'Previous page',
          nextPageItemAriaLabel: 'Next page',
          firstPageItemAriaLabel: 'First page',
          lastPageItemAriaLabel: 'Last page',
          pageItemAriaLabel({ currentPage: currentRefinement }) {
            return `Page ${currentRefinement}`;
          },
        }}
      />
      <RangeInput
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={{ min: 0, max: 500 }}
        attribute="price"
        translations={{
          submitButtonText: 'ok',
          separatorElementText: 'to',
        }}
      />
      <RefinementList
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={['Apple', 'Insignia']}
        attribute="brand"
        /* TODO: `facetOrdering` is not supported anymore, see the new `sortBy` prop
        there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby */
        facetOrdering={false}
        translations={{
          showMoreButtonText({ isShowingMore: expanded }) {
            return expanded ? 'Show less' : 'Show more';
          },

          noResultsText: 'No results',
          submitButtonTitle: 'Submit your search query.',
          resetButtonTitle: 'Clear your search query.'
        }}
        searchablePlaceholder='Search here...' />
      <SearchBox
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement="iphone"
        /* TODO: `focusShortcuts` is not supported anymore, see there for suggestions on how to replace
        it : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-focusshortcuts-with-custom-code */
        focusShortcuts={['s']}
        translations={{
          submitButtonTitle: 'Submit your search query.',
          resetButtonTitle: 'Clear your search query.'
        }}
        placeholder='Search here...' />
      <SortBy /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
      defaultRefinement="instant_search_asc" />
      <ToggleRefinement
        on={true}
        attribute="free_shipping"
        /* TODO: Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={true}
      />
      <Hits
        hitComponent={(hit) => (
          <Highlight highlightedTagName="span">{JSON.stringify(hit)}</Highlight>
        )}
      />
    </InstantSearch>
  );
}

export default App;
