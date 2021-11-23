# react-instantsearch-hooks

> 🚧 This version is not yet production-ready.

React InstantSearch Hooks is an open-source, **experimental UI library** for React that lets you quickly build a search interface in your front-end application.

## Installation

React InstantSearch Hooks is available on the npm registry. It relies on [`algoliasearch`](https://github.com/algolia/algoliasearch-client-javascript) to communicate with Algolia APIs.

```sh
yarn add react-instantsearch-hooks algoliasearch
# or
npm install react-instantsearch-hooks algoliasearch
```

## Getting started

This package exposes [Hooks](https://reactjs.org/docs/hooks-intro.html) but no UI components (yet!). **You're in charge of building components based on the exposed Hooks.**

Let's start with a `SearchBox` component based on [`useSearchBox`](#usesearchbox):

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSearchBox } from 'react-instantsearch-hooks';

export function SearchBox(props) {
  const { query, refine, isSearchStalled } = useSearchBox(props);
  const [value, setValue] = useState(query);
  const inputRef = useRef(null);

  function onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    if (inputRef.current) {
      inputRef.current.blur();
    }
  }

  function onReset(event) {
    event.preventDefault();
    event.stopPropagation();

    setValue('');

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function onChange(event) {
    setValue(event.currentTarget.value);
  }

  useEffect(() => {
    refine(value);
  }, [refine, value]);

  useEffect(() => {
    if (query !== value) {
      setValue(query);
    }
  }, [query]);

  return (
    <div className="ais-SearchBox">
      <form
        action=""
        className="ais-SearchBox-form"
        noValidate
        onSubmit={onSubmit}
        onReset={onReset}
      >
        <input
          ref={inputRef}
          className="ais-SearchBox-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={props.placeholder}
          spellCheck={false}
          maxLength={512}
          type="search"
          value={value}
          onChange={onChange}
        />

        <button
          className="ais-SearchBox-submit"
          type="submit"
          title="Submit the search query."
        >
          <svg
            className="ais-SearchBox-submitIcon"
            width="10"
            height="10"
            viewBox="0 0 40 40"
          >
            <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
          </svg>
        </button>

        <button
          className="ais-SearchBox-reset"
          type="reset"
          title="Clear the search query."
          hidden={value.length === 0 && !isSearchStalled}
        >
          <svg
            className="ais-SearchBox-resetIcon"
            viewBox="0 0 20 20"
            width="10"
            height="10"
          >
            <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
}
```

Then, you can create a `Hits` component with [`useHits`](#usehits):

```jsx
import React from 'react';
import { useHits } from 'react-instantsearch-hooks';

export function Hits({ hitComponent: Hit, ...props }) {
  const { hits } = useHits(props);

  return (
    <div className="ais-Hits">
      <ol className="ais-Hits-list">
        {hits.map((hit) => (
          <li key={hit.objectID} className="ais-Hits-item">
            <Hit hit={hit} />
          </li>
        ))}
      </ol>
    </div>
  );
}
```

You can now use these components in the `InstantSearch` provider:

```javascript
import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, useConnector } from 'react-instantsearch-hooks';

import { SearchBox } from './SearchBox';
import { Hits } from './Hits';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

function App() {
  return (
    <InstantSearch indexName="instant_search" searchClient={searchClient}>
      <SearchBox />
      <Hits />
    </InstantSearch>
  );
}
```

<p align="center">
  <a href="https://codesandbox.io/s/github/algolia/react-instantsearch/tree/master/examples/hooks" title="Edit on CodeSandbox">
    <img alt="Edit on CodeSandbox" src="https://codesandbox.io/static/img/play-codesandbox.svg">
  </a>
</p>

You can build any InstantSearch widget using [InstantSearch.js connectors](https://www.algolia.com/doc/api-reference/widgets/js/) with the [`useConnector`](#useconnector) Hook.

## API

### `InstantSearch`

The root provider component of all React InstantSearch hooks.

```jsx
import { InstantSearch } from 'react-instantsearch-hooks';
```

It accepts all [props from the InstantSearch.js `instantsearch` widget](https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/#options).

#### `indexName`

> `string` | **required**

The main index to search into.

```jsx
<InstantSearch
  // ...
  indexName="instant_search"
>
  {/* Widgets */}
</InstantSearch>
```

#### `searchClient`

> `object` | **required**

Provides a search client to [`InstantSearch`](#instantsearch).

```jsx
const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

<InstantSearch
  // ...
  searchClient={searchClient}
>
  {/* Widgets */}
</InstantSearch>;
```

### `initialUiState`

> `object`

Provides an initial state to your React InstantSearch widgets using InstantSearch.js' [`uiState`](https://www.algolia.com/doc/api-reference/widgets/ui-state/js/). To provide an initial state, you must add the corresponding widgets to your implementation.

```jsx
<InstantSearch
  // ...
  initialUiState={{
    indexName: {
      query: 'phone',
      page: 5,
    },
  }}
>
  {/* Widgets */}
</InstantSearch>
```

### `onStateChange`

> `function`

Triggers when the state changes.

When using this option, the instance becomes controlled. This means that **you become responsible for updating the UI state** with `setUiState`.

This is useful to perform custom logic whenever the state changes.

```jsx
<InstantSearch
  // ...
  onStateChange={({ uiState, setUiState }) => {
    // Custom logic

    setUiState(uiState);
  }}
>
  {/* Widgets */}
</InstantSearch>
```

### `stalledSearchDelay`

> `number` | defaults to `200`

Defines a time period after which a search is considered stalled. You can find more information in the [slow network guide](https://www.algolia.com/doc/guides/building-search-ui/going-further/improve-performance/js/#mitigate-the-impact-of-slow-network-in-your-search-application).

```jsx
<InstantSearch
  // ...
  stalledSearchDelay={500}
>
  {/* Widgets */}
</InstantSearch>
```

### `routing`

> `boolean | object`

The router configuration used to save the UI state into the URL, or any client-side persistence. You can find more information in the [routing guide](https://www.algolia.com/doc/guides/building-search-ui/going-further/routing-urls/js/).

```jsx
<InstantSearch
  // ...
  routing={true}
>
  {/* Widgets */}
</InstantSearch>
```

### `suppressExperimentalWarning`

> `boolean`

Removes the console warning about the experimental version. Note that this warning is only displayed in development mode.

```jsx
<InstantSearch
  // ...
  suppressExperimentalWarning={true}
>
  {/* Widgets */}
</InstantSearch>
```

### `Index`

The provider component for an Algolia index. It's useful when you want to build a [federated search interface](https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/multi-index-search/js/).

It accepts all [props from the InstantSearch.js `index` widget](https://www.algolia.com/doc/api-reference/widgets/index-widget/js/#options).

#### `indexName`

> `string` | **required**

The index to search into.

```jsx
<Index indexName="instant_search">{/* Widgets */}</Index>
```

#### `indexId`

> `string`

An identifier for the `Index` widget. Providing an `indexId` allows different index widgets to target the same Algolia index. It’s especially useful for the [routing](#routing) feature, and lets you find the refinements that match an [`Index`](#index) widget.

```jsx
<Index
  // ...
  indexId="instant_search"
>
  {/* Widgets */}
</Index>
```

### `useSearchBox`

> `(props: UseSearchBoxProps) => SearchBoxRenderState`

Hook to use a [search box](https://www.algolia.com/doc/api-reference/widgets/search-box/js/).

**Types**

<details>
<summary><code>UseSearchBoxProps</code></summary>

```ts
type UseSearchBoxProps = {
  /**
   * Function called every time the query changes.
   */
  queryHook?: (query: string, hook: (value: string) => void) => void;
};
```

</details>

<details>
<summary><code>SearchBoxRenderState</code></summary>

```ts
type SearchBoxRenderState = {
  /**
   * The query from the last search.
   */
  query: string;
  /**
   * Sets a new query and searches.
   */
  refine: (value: string) => void;
  /**
   * Clears the query and searches.
   */
  clear: () => void;
  /**
   * Whether the search results take more than a certain time to come back from
   * Algolia servers.
   * This can be configured on <InstantSearch /> with the `stalledSearchDelay`
   * props which defaults to 200ms.
   */
  isSearchStalled: boolean;
};
```

</details>

**Example**

```jsx
function SearchBox(props) {
  const { query, refine } = useSearchBox(props);

  return {
    /* Markup */
  };
}
```

### `useHits`

> `(props: UseHitsProps) => HitsRenderState`

Hook to use [hits](https://www.algolia.com/doc/api-reference/widgets/hits/js/).

**Types**

<details>
<summary><code>UseHitsProps</code></summary>

```ts
type UseHitsProps = {
  /**
   * Whether to escape HTML tags from hits string values.
   * @default true
   */
  escapeHTML?: boolean;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: (items: TItem[]) => TItem[];
};
```

</details>

<details>
<summary><code>HitsRenderState</code></summary>

```ts
type HitsRenderState = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Hits;
  /**
   * The response from the Algolia API.
   */
  results?: SearchResults;
  /**
   * Sends an event to the Insights middleware.
   */
  sendEvent: (eventType: string, hits: Hit | Hits, eventName?: string) => void;
};
```

</details>

**Example**

```jsx
function Hits(props) {
  const { hits } = useHits(props);

  return {
    /* Markup */
  };
}
```

### `useHierarchicalMenu`

> `(props: UseHierarchicalMenuProps) => HierarchicalMenuRenderState`

Hook to use a [hierarchical menu](https://www.algolia.com/doc/api-reference/widgets/hierarchical-menu/js/).

**Types**

<details>
<summary><code>UseHierarchicalMenuProps</code></summary>

```ts
type UseHierarchicalMenuProps = {
  /**
   * The name of the attributes in the records.
   */
  attributes: string[];
  /**
   * Separator used in the attributes to separate level values.
   */
  separator?: string;
  /**
   * Prefix path to use if the first level is not the root level.
   */
  rootPath?: string | null;
  /**
   * Show the siblings of the selected parent levels of the current refined value. This
   * does not impact the root level.
   */
  showParentLevel?: boolean;
  /**
   * The max number of items to display when
   * `showMoreLimit` is not set or if the widget is showing less value.
   */
  limit?: number;
  /**
   * Whether to display a button that expands the number of items.
   */
  showMore?: boolean;
  /**
   * The max number of items to display if the widget
   * is showing more items.
   */
  showMoreLimit?: number;
  /**
   * How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
   *
   * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
   *
   * If a facetOrdering is set in the index settings, it is used when sortBy isn't passed
   */
  sortBy?: SortBy<HierarchicalMenuItem>;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<HierarchicalMenuItem>;
};
```

</details>

<details>
<summary><code>HierarchicalMenuRenderState</code></summary>

```ts
export type HierarchicalMenuItem = {
  /**
   * The value of the refinement list item.
   */
  value: string;
  /**
   * Human-readable value of the refinement list item.
   */
  label: string;
  /**
   * Human-readable value of the searched refinement list item.
   */
  highlighted?: string;
  /**
   * Number of matched results after refinement is applied.
   */
  count: number;
  /**
   * Indicates if the list item is refined.
   */
  isRefined: boolean;
  /**
   * n+1 level of items, same structure HierarchicalMenuItem
   */
  data: HierarchicalMenuItem[] | null;
};

type HierarchicalMenuRenderState = {
  /**
   * The list of filtering values returned from Algolia API.
   */
  items: HierarchicalMenuItem[];
  /**
   * Creates the next state url for a selected refinement.
   */
  createURL: (value: string) => string;
  /**
   * Action to apply selected refinements.
   */
  refine(value: string): void;
  /**
   * Send event to insights middleware
   */
  sendEvent: (
    eventType: string,
    facetValue: string,
    eventName?: string
  ) => void;
  /**
   * `true` if a refinement can be applied.
   */
  canRefine: boolean;
  /**
   * `true` if the toggleShowMore button can be activated (enough items to display more or
   * already displaying more than `limit` items)
   */
  canToggleShowMore: boolean;
  /**
   * True if the menu is displaying all the menu items.
   */
  isShowingMore: boolean;
  /**
   * Toggles the number of values displayed between `limit` and `showMoreLimit`.
   */
  toggleShowMore: () => void;
};
```

</details>

**Example**

```jsx
function HierarchicalMenu(props) {
  const { items } = useHierarchicalMenu(props);

  return {
    /* Markup */
  };
}
```

### `useRefinementList`

> `(props: UseRefinementListProps) => RefinementListRenderState`

Hook to use a [refinement list](https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/).

**Types**

<details>
<summary><code>UseRefinementListProps</code></summary>

```ts
type UseRefinementListProps = {
  /**
   * The name of the attribute in the records.
   */
  attribute: string;
  /**
   * How the filters are combined together.
   */
  operator?: 'and' | 'or';
  /**
   * The max number of items to display when
   * `showMoreLimit` is not set or if the widget is showing less value.
   */
  limit?: number;
  /**
   * Whether to display a button that expands the number of items.
   */
  showMore?: boolean;
  /**
   * The max number of items to display if the widget
   * is showing more items.
   */
  showMoreLimit?: number;
  /**
   * How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
   *
   * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
   *
   * If a facetOrdering is set in the index settings, it is used when sortBy isn't passed
   */
  sortBy?: SortBy<RefinementListItem>;
  /**
   * Escapes the content of the facet values.
   */
  escapeFacetValues?: boolean;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<RefinementListItem>;
};
```

</details>

<details>
<summary><code>RefinementListRenderState</code></summary>

```ts
export type RefinementListItem = {
  /**
   * The value of the refinement list item.
   */
  value: string;
  /**
   * Human-readable value of the refinement list item.
   */
  label: string;
  /**
   * Human-readable value of the searched refinement list item.
   */
  highlighted?: string;
  /**
   * Number of matched results after refinement is applied.
   */
  count: number;
  /**
   * Indicates if the list item is refined.
   */
  isRefined: boolean;
};

type RefinementListRenderState = {
  /**
   * The list of filtering values returned from Algolia API.
   */
  items: RefinementListItem[];
  /**
   * indicates whether the results are exhaustive (complete)
   */
  hasExhaustiveItems: boolean;
  /**
   * Creates the next state url for a selected refinement.
   */
  createURL: (value: string) => string;
  /**
   * Action to apply selected refinements.
   */
  refine(value: string): void;
  /**
   * Send event to insights middleware
   */
  sendEvent: (
    eventType: string,
    facetValue: string,
    eventName?: string
  ) => void;
  /**
   * Searches for values inside the list.
   */
  searchForItems: (query: string) => void;
  /**
   * `true` if the values are from an index search.
   */
  isFromSearch: boolean;
  /**
   * `true` if a refinement can be applied.
   */
  canRefine: boolean;
  /**
   * `true` if the toggleShowMore button can be activated (enough items to display more or
   * already displaying more than `limit` items)
   */
  canToggleShowMore: boolean;
  /**
   * True if the menu is displaying all the menu items.
   */
  isShowingMore: boolean;
  /**
   * Toggles the number of values displayed between `limit` and `showMoreLimit`.
   */
  toggleShowMore: () => void;
};
```

</details>

**Example**

```jsx
function RefinementList(props) {
  const { items } = useRefinementList(props);

  return {
    /* Markup */
  };
}
```

### `useSortBy`

> `(props: UseSortByProps) => SortByRenderState`

Hook to [sort by](https://www.algolia.com/doc/api-reference/widgets/sort-by/js/) specified indices.

**Types**

<details>
<summary><code>SortByItem</code></summary>

```ts
type SortByItem = {
  /**
   * The name of the index to target.
   */
  value: string;
  /**
   * The label of the index to display.
   */
  label: string;
};
```

</details>

<details>
<summary><code>UseSortByProps</code></summary>

```ts
type UseSortByProps = {
  /**
   * Array of objects defining the different indices to choose from.
   */
  items: SortByItem[];
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<SortByItem>;
};
```

</details>

<details>
<summary><code>SortByRenderState</code></summary>

```ts
type SortByRenderState = {
  /**
   * The initially selected index.
   */
  initialIndex?: string;
  /**
   * The currently selected index.
   */
  currentRefinement: string;
  /**
   * All the available indices
   */
  options: SortByItem[];
  /**
   * Switches indices and triggers a new search.
   */
  refine: (value: string) => void;
  /**
   * `true` if the last search contains no result.
   */
  hasNoResults: boolean;
};
```

</details>

**Example**

```jsx
function SortBy(props) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return {
    /* Markup */
  };
}
```

### `useConnector`

> `<TProps, TWidgetDescription>(connector: Connector<TWidgetDescription, TProps>, props: TProps) => TWidgetDescription['renderState']`

React Hook to plug an InstantSearch.js connector to React InstantSearch.

Here's an example to use [`connectMenu`](https://www.algolia.com/doc/api-reference/widgets/menu/js/#connector):

```jsx
import connectMenu from 'instantsearch.js/es/connectors/menu/connectMenu';
import { useConnector } from 'react-instantsearch-hooks';

function useMenu(props) {
  return useConnector(connectMenu, props);
}
```

If you use TypeScript:

```ts
import connectMenu, {
  MenuConnectorParams,
  MenuWidgetDescription,
} from 'instantsearch.js/es/connectors/menu/connectMenu';
import { useConnector } from './useConnector';

type UseMenuProps = MenuConnectorParams;

function useMenu(props: UseMenuProps) {
  return useConnector<MenuConnectorParams, MenuWidgetDescription>(
    connectMenu,
    props
  );
}
```
