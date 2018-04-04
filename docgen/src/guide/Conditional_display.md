---
title: Conditional display
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 40
---

When no results are found you might want to display some specific contents helping the user go back
to a search that was successful. 

To help you do conditional rendering based on the `searchState` and the 
`searchResults` of InstantSearch, we provide the [`connectStateResults`](connectors/connectStateResults.html) connector. 

## Displaying content when the query is empty

```jsx
const Content = connectStateResults(
  ({ searchState }) =>
    searchState && searchState.query
      ? <div>
          The query {searchState.query} exists
        </div>
      : <div>No query</div>
);
```

## Displaying content when there's no results

```jsx
const Content = connectStateResults(
  ({ searchState, searchResults }) =>
    searchResults && searchResults.nbHits !== 0
      ? <div>Some results</div>
      : <div>
          No results has been found for {searchState.query}
        </div>
);
```

## Displaying content when there's an error

```jsx
const Content = connectStateResults(
  ({ error }) =>
    error ? <div>Some error</div> : <div>No error</div>
);
```

## Displaying content when loading

In slow user network situations you might want to know when the search results are loading.

```jsx
const Content = connectStateResults(
  ({ searching }) =>
    searching ? <div>We are searching</div> : <div>Search finished</div>
);
```

Alternatively, if you're using the search in List feature then you can know when the search results are loading by doing:

```jsx
const Content = connectStateResults(
  ({ searchingForFacetValues }) =>
    searchingForFacetValues ? <div>We are searching</div> : <div>Search finished</div>
);
```

## Conditional display when dealing with multi indices

If you're using the `<Index>` API and want to apply some conditional rendering you have access to the `searchResults` but also to all the results of every used indices looking at `allSearchResults`. 

```jsx
const App = () => (
  <InstantSearch appId="" apiKey="" indexName="first">
    <SearchBox />
    <AllResults>
      <div>
        <Index indexName="first">
          <IndexResults>
            <div>
              <div>first: </div>
              <Hits />
            </div>
          </IndexResults>
        </Index>
        <Index indexName="second">
          <IndexResults>
            <div>
              <div>second: </div>
              <Hits />
            </div>
          </IndexResults>
        </Index>
        <Index indexName="third">
          <IndexResults>
            <div>
              <div>third: </div>
              <Hits />
            </div>
          </IndexResults>
        </Index>
      </div>
    </AllResults>
  </InstantSearch>
);

const IndexResults = connectStateResults(
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

const AllResults = connectStateResults(({ allSearchResults, children }) => {
  const hasResults =
    allSearchResults &&
    Object.values(allSearchResults).some(results => results.nbHits > 0);

  return !hasResults ? (
    <div>
      <div>No results in category, products or brand</div>
      <Index indexName="first" />
      <Index indexName="second" />
      <Index indexName="third" />
    </div>
  ) : (
    children
  );
});
```


<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Custom_connectors.html">← Custom Connectors</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/React_native.html">React native →</a>
    </div>
</div>
