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
  const [refreshValue] = useState(0);

  return (
    <InstantSearch
      /* TODO (Codemod generated): `searchState` is no longer supported. This is now handled via an `onStateChange` callback.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-searchstate-with-initialuistate */
      searchState={{}}
      /* TODO (Codemod generated): `resultsState` is no longer supported, if you used it for server-side rendering, you can follow
      this guide : https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/ */
      resultsState={{}}
      /* TODO (Codemod generated): `createURL` should be moved to the `routing` prop.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#move-createurl-in-routing */
      createURL={() => {}}
      /* TODO (Codemod generated): `onSearchStateChange` is no longer supported. This is now handled via an `onStateChange` callback.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-onsearchstatechange-with-onstatechange */
      onSearchStateChange={() => {}}
      /* TODO (Codemod generated): `onSearchParameters` is no longer supported, if you used it for server-side rendering, you can follow
      this guide : https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/ */
      onSearchParameters={() => {}}
      /* TODO (Codemod generated): the `refresh` prop is no longer a prop on `InstantSearch`. It can now be called programmatically via the `refresh` function returned by `useInstantSearch`.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-refresh-prop-with-refresh-from-useinstantsearch */
      refresh={refreshValue}
      indexName="instant_search"
    >
      <Breadcrumb rootPath="/truc" translations={{ rootElementText: 'Home' }} />
      <ClearRefinements
        excludedAttributes={[]}
        translations={{ resetButtonText: 'Clear all filters' }}
      />
      <CurrentRefinements excludedAttributes={[]} />
      <HierarchicalMenu
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement="Cameras & Camcorders"
        attributes={['categories.lvl0', 'categories.lvl1']}
        /* TODO (Codemod generated): `facetOrdering` is not supported anymore, see the new `sortBy` prop
        there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby */
        facetOrdering={false}
        translations={{
          showMoreButtonText({
            isShowingMore: expanded
          }) {
            return expanded ? 'Show less' : 'Show more';
          },
        }}
      />
      <HitsPerPage
        /* TODO (Codemod generated): Remove this `defaultRefinement` prop and add `default: true` to the corresponding item in the `items` array prop. */
        defaultRefinement={5}
        items={[
          { value: 5, label: 'Show 5 hits' },
          { value: 10, label: 'Show 10 hits' },
        ]}
      />
      <Menu
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement="Audio"
        attribute="category"
        /* TODO (Codemod generated): `facetOrdering` is not supported anymore, see the new `sortBy` prop
        there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby */
        facetOrdering={false}
        translations={{
          showMoreButtonText({
            isShowingMore: expanded
          }) {
            return expanded ? 'Show less' : 'Show more';
          },
          noResults: 'No results',
        }}
      />
      <Pagination
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={2}
        translations={{
          previousPageItemText: '‹',
          nextPageItemText: '›',
          firstPageItemText: '«',
          lastPageItemText: '»',
          pageItemText({
            currentPage: currentRefinement
          }) {
            return currentRefinement;
          },
          previousPageItemAriaLabel: 'Previous page',
          nextPageItemAriaLabel: 'Next page',
          firstPageItemAriaLabel: 'First page',
          lastPageItemAriaLabel: 'Last page',
          pageItemAriaLabel({
            currentPage: currentRefinement
          }) {
            return `Page ${currentRefinement}`;
          },
        }}
      />
      <RangeInput
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={{ min: 0, max: 500 }}
        attribute="price"
        translations={{
          submitButtonText: 'ok',
          separatorElementText: 'to',
        }}
      />
      <RefinementList
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement={['Apple', 'Insignia']}
        attribute="brand"
        /* TODO (Codemod generated): `facetOrdering` is not supported anymore, see the new `sortBy` prop
        there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby */
        facetOrdering={false}
        translations={{
          showMoreButtonText({
            isShowingMore: expanded
          }) {
            return expanded ? 'Show less' : 'Show more';
          },

          noResultsText: 'No results',
          submitButtonTitle: 'Submit your search query.',
          resetButtonTitle: 'Clear your search query.'
        }}
        searchablePlaceholder='Search here...' />
      <SearchBox
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
        defaultRefinement="iphone"
        /* TODO (Codemod generated): `focusShortcuts` is not supported anymore, see there for suggestions on how to replace
        it : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-focusshortcuts-with-custom-code */
        focusShortcuts={['s']}
        translations={{
          submitButtonTitle: 'Submit your search query.',
          resetButtonTitle: 'Clear your search query.'
        }}
        placeholder='Search here...' />
      <SortBy /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
      See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements */
      defaultRefinement="instant_search_asc" />
      <ToggleRefinement
        on={true}
        attribute="free_shipping"
        /* TODO (Codemod generated): Move this into `InstantSearch`'s `initialUiState` prop.
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
