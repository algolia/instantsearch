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

## API proposal

### Concept

We have an `<InstantSearch>` provider, just wrap your application with it then use any widget.

Widgets are UI elements with predefined behavior that you can change.

To enhance a widget, you can provide either `renderer` options or your very own renderer that will access
the widget data along with being able to call widget methods.

All widgets are using the BEM notation making it easy to build themes or
style them.

### instantiation

Wrap your application with:

```jsx
<InstantSearch
  appId="algolia application ID"
  apiKey="algolia API key"
>
  <SearchBox/>
  <Hits/>
</InstantSearch>
```

### SearchBox

```jsx
<SearchBox
  queryHook={(query, search) => search(query)} // allows to implement debouncing
  renderer={{
    searchAsYouType: true // otherwise only search when submit called
    focusShortcuts: ['s', '/'] // `s` is github, `/` is all google products
    translations: {placeholder: "Search here"}
    placeholder: true
    autofocus: true
  }}
  // or renderer={CustomSearchBox}
/>
```

The default renderer rendering should include:
- submit icon
- clear icon (reset)

Custom renderer props:
- query: `string` current query
- setQuery(query: `string`): `function`
- search(): `function`

See http://shipow.github.io/searchbox/ for good examples like the amazon one.

### Hits

Display hits

```jsx
<Hits
  limit={20}
  renderer={{itemComponent: hit => <div>{JSON.stringify(hit)}</div>}}
  // or
  // renderer={CustomHitsRenderer}
/>
```

Custom renderer props:
- hits: `object`

### No hits

Define me

### Pagination

```jsx
<Pagination
  renderer={{
    showFirst: true,
    showLast: false,
    showPrevious: true,
    showNext: true,
    scrollTo: 'body',
    maxPages: undefined, // automatically computed from the Algolia answer
    padding: 3,
    translations: {
      previous: 'Previous page',
      next: 'Next page',
      first: 'First page',
      last: 'Last page'
    }
  }}
  // or
  // renderer={CustomPagination}
/>
```

Custom renderer props:
- options: `object`
- refine(page: `number`): `function`

SearchKit has some default renderers that may be interesting: http://docs.searchkit.co/stable/docs/components/ui/list-components.html

### HitsPerPageSelector

```jsx
<HitsPerPageSelector
  options={[10, 20, 30]}
  renderer={{
    selectLabel: 'Hits per page:', // added as a <label>Hits per page: <select></label>
    optionLabel: value => value, // allows to show 'Only ten results', 'At least 20 results' in the select
  }} // will add a <label></label>
  // or
  // renderer={CustomHitsPerPageSelector}
/>
```

Default renderer: Select.

Custom renderer props:
- options: `object`
- refine(hitsPerPage: `number`): `function`

SearchKit has some default renderers that may be interesting: http://docs.searchkit.co/stable/docs/components/ui/list-components.html

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

### Creating your own widget

## Repository organization

## Website organization
