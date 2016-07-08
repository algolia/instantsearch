# instantsearch-react

Set of React components to build instantsearch interfaces using Algolia API.

This document is an API proposal. It aims at kickstarting the
discussion and actual coding of instantsearch-react.

## Context

[instantsearch.js](https://github.com/algolia/instantsearch.js/) is a library of widgets designed for high
performance instant search experiences.

instantsearch.js is great for people not using any big framework. But as soon as you are using React,
AngularJS, Ember.js or vue.js then it starts to be really tricky to get it working for you.

Not only you may have bugs but also since instantsearch.js is already a heavy filesize library, you might be
relunctant to integrate.

tl;dr; Your favorite framework idioms may not map to anything inside instantsearch.js.

Internally, instantsearch.js widgets are already built using React but that's an implementation detail and not
an API feature.

To solve this situation, we want to provide the right tools for the right situation. This starts
by providing a set of reusable React components to people willing to use React and Algolia.

We will sometime reuse ideas from [searchkit/searchkit](https://github.com/searchkit/searchkit).

## Concept

We have an `<InstantSearch>` provider, just wrap your application with it then use any widget.

Widgets are UI elements with predefined behaviors that you can change.

We have higher order components like createSearBox(Component) that allows you to create your
own SearchBox while reusing logical pieces from instantsearch.js.

## instantiation

Wrap your application with:

```jsx
<InstantSearch
  appId="appId"
  apiKey="apiKey"
>
  <SearchBox/>
  <Hits/>
</InstantSearch>
```

### Widgets

### `<SearchBox/>`

Default props:

```jsx
<SearchBox
  queryHook={(query, search) => search(query)} // allows to implement debouncing
  searchAsYouType // otherwise only search when submit called
  focusShortcuts={['s', '/']} // `s` is github, `/` is all google products
  translations={{placeholder: 'Search here'}}
  placeholder
  autofocus
/>
```

The default rendering should include:
- submit icon
- clear icon (reset)

`createSearchBox` HOC props:
- query: `string` current query
- setQuery(query: `string`): `function`
- search(): `function`

See http://shipow.github.io/searchbox/ for good examples like the google or amazon one.

### Hits

Display hits

```jsx
<Hits
  hitsPerPage={20}
  itemComponent: {hit => <div>{JSON.stringify(hit)}</div>}
/>
```

`createHits` HOC props:
- hits: `object[]`

### Pagination

```jsx
<Pagination
  showFirst,
  showLast={false},
  showPrevious,
  showNext,
  scrollTo="body", // maybe not the best API for a react lib
  maxPages={null}, // automatically computed from the Algolia answer, but can be overriden
  pagesPadding={3}, // how many pages to show before and after
  translations= {{
    previous: 'Previous page',
    next: 'Next page',
    first: 'First page',
    last: 'Last page'
  }}
/>
```

`createPagination` HOC props:
- data: `object[]`
- refine(page: `number`): `function`

SearchKit has some default renderers that may be interesting: http://docs.searchkit.co/stable/docs/components/ui/list-components.html

### HitsPerPageSelector

```jsx
<HitsPerPage
  options={[10, 20, 30]}
  translations={{
    selectLabel: 'Hits per page',
    optionLabel: value => value
  }}
/>
```

Default renderer: Select.

`createHitsPerPage` props:
- data: `object[]`
- refine(hitsPerPage: `number`): `function`

SearchKit has some default renderers that may be interesting: http://docs.searchkit.co/stable/docs/components/ui/list-components.html

** EVERYTHING BELOW IS NOT SPEC'D **

** REAL WORLD STOPS HERE **

### LoadMore

Simple "load more" button to display more hits and scroll automatically,
see http://codepen.io/vvo/pen/jAwXoo.

### PreviousNext

Simple Previous / Next paginator.
see https://www.npmjs.com/search?q=algolia

### Menu

```jsx
<Menu
  attributeName={undefined}
  facetValues={[]} // provide default facet values to be used instead of the ones found in the API
  defaultRefinedValues={[]} // provide facet values that will be selected by default
  limitMin={10} // minimum facet values to show
  limitMax={100} // maximum facet values to show
  renderer={{
    showMore: true, // show a showMore button that will display limitMax items when activated
    itemComponent={
      (facetValue, refine) =>
        <a href={facetValue.url} onClick={refine}>{facetValue.name} <span>{facetValue.count}</span></a>
    }
  }}
  // or
  // renderer={CustomMenu}
/>
```

Default renderer: ItemList.

Custom renderer props:
- facetValues: `object`
- showMore: `function` call this to get limitMax
- refine(facetValue): `function`

### RefinementList

### HierarchicalMenu

### Nohits

### Loading

### Creating your own widget

## higher order components

They allow to create your own full rendering without having to know much about Algolia
internals like the REST API or the helper.

For most widgets, we have some `data` items with names and possible  count.
Using this data, we can `refine(a value)`.

We can make the public HOC API simple and reuse a lot of code internally if we
keep the same structure of props in our HOC (`data`, `refine`).

## Default renderers

const selectMenu = createMenu(Select);
const hitsPerPageLinks = createHitsPerPage(ItemList);

see http://docs.searchkit.co/stable/docs/components/ui/list-components.html

## Url synchronisation

## Translations

## Styling

## Initial parameters
- use filters

## Repository organization

## Website organization

## Examples

- react router
- redux
