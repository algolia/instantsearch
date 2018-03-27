---
title: React
layout: main.pug
category: gettingstarted
withHeadings: true
navScroll: true
---

## Welcome to React InstantSearch

React InstantSearch is the ultimate toolbox for creating instant-search
experiences using [React](https://facebook.github.io/react/) and [Algolia](https://www.algolia.com/).

In this tutorial, you'll learn how to:

* install `react-instantsearch` in your [React](https://facebook.github.io/react/) project
* bootstrap an app using the `<InstantSearch>` component
* display results from Algolia
* add widgets to filter the results
* connect your own component to the search

**If you prefer to get started by watching a video, [we created one for you](videos/).**

**If you want to use React InstantSearch with React Native, [read our dedicated Getting Started for React Native](guide/React_native.html).**

## Before we start

React InstantSearch is meant to be used with Algolia.

Therefore, you'll need the credentials to an Algolia index. To ease
this getting started, here are the credentials to an already configured index:

* `appId`: `latency`
* `searchKey`: `3d9875e51fbd20c7754e65422f7ce5e1`
* `indexName`: `bestbuy`

It contains sample data for an e-commerce website.

This guide also expects you to have a working [React](https://facebook.github.io/react/) project. If you need to setup a React project, we suggest you use
[facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app#getting-started) which is the official React-CLI from Facebook.

## Install `react-instantsearch`

React InstantSearch is available in the [npm](https://www.npmjs.com) registry. Install it:

```shell
yarn add react-instantsearch
```

Note: we use `yarn add` to install dependencies but React InstantSearch is also installable via `npm install`.

## Add the `<InstantSearch>` component

[`<InstantSearch>`](widgets/<InstantSearch>.html) is the component that will connect to Algolia
and will synchronise all the widgets together.

It maintains the state
of the search, does the queries, and provides the results to the widgets so
that they can update themselves when needed.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

import { InstantSearch } from 'react-instantsearch/dom';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="3d9875e51fbd20c7754e65422f7ce5e1"
    indexName="bestbuy"
  >
    {/* Search widgets will go there */}
  </InstantSearch>
);

// Needed only if your js app doesn't do it already.
// Create-react-app does it for you
ReactDOM.render(<App />, document.querySelector('#app'));
```

`appId`, `apiKey` and `indexName` are mandatory. Those props are the
credentials of your application in Algolia. They can be found in your [Algolia
dashboard](https://www.algolia.com/api-keys).

Congrats 🎉! Your application is now connected to Algolia.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

* How to connect a part of a [React](https://facebook.github.io/react/) application to Algolia

* How to configure your Algolia credentials

> To get more _under the hood_ information about the `<InstantSearch>` wrapper
> component, [read our guide](guide/<InstantSearch>.html).

</div>

## Load the Algolia theme

We do not inject any CSS in your application by default, only CSS class names are declared
on our widgets. It's your responsibility to then load a theme or style the CSS classes accordingly.

We provide an Algolia theme that should be a good start.

Include it in your webpage with this CDN link or copy paste the raw content:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/algolia-min.css">
```

Read the [styling](guide/Styling_widgets.html) guide for more information.

## Display results

The core of a search experience is to display results. By default, React InstantSearch
will do a query at the start of the page and will retrieve the most relevant hits.

To display results, we are gonna use the [Hits](widgets/Hits.html) widget. This widget will
display all the results returned by Algolia, and it will update when there
are new results.

While we're doing that, let's create a new component for the search so we
ease the reading of our React code:

```jsx
// First, we need to add the Hits component to our import
import { InstantSearch, Hits } from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className="container">
      <Hits />
    </div>
  );
}
```

We can then call this component in the render of App:

```jsx
const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="3d9875e51fbd20c7754e65422f7ce5e1"
    indexName="bestbuy"
  >
    <Search />
  </InstantSearch>
);
```

You should now be able to see the results without any styling. This
view lets you inspect the values that are retrieved from Algolia, in order
to build your custom view.

In order to customize the view for each product, we can use a special prop
of the Hit widget: `hitComponent`. This prop accepts a Component that
will be used for each hit in the results from Algolia.

```jsx
function Product({ hit }) {
  return <div>{hit.name}</div>;
}
```

The widget receives a prop `hit` that contains the content of the
record. Here we are only displaying the name for the sake of simplicity
but there is no limit as long as the data is in the record.

Now let's modify the `Hits` usage to add our new `hitComponent`.

```jsx
function Search() {
  return (
    <div>
      <Hits hitComponent={Product} />
    </div>
  );
}
```

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

* how to display the results from Algolia

* how to customize the display of those results
  </div>

## Add a SearchBox

Now that we've added the results, we can start querying our index. To do this, we are gonna use the [Searchbox](widgets/SearchBox.html) widget. Let's add it
in the Search component that we created before:

```jsx
// We need to add the SearchBox to our import
import { InstantSearch, Hits, SearchBox } from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div>
      <SearchBox />
      <Hits hitComponent={Product} />
    </div>
  );
}
```

The search is now interactive but we don't see what matched in each of the products.
Good thing for us, Algolia computes the matching part. Let's add this to our custom
search result component:

```jsx
// We need to add the Highlight widget to our import
import {
  InstantSearch,
  Hits,
  SearchBox,
  Highlight
} from 'react-instantsearch/dom';

// [...]

function Product({ hit }) {
  return (
    <div style={{ marginTop: '10px' }}>
      <span className="hit-name">
        <Highlight attribute="name" hit={hit} />
      </span>
    </div>
  );
}
```

Now the search displays the results and highlights the part of the hit attribute
that matches the query. This pattern is very important in search, especially with
Algolia, so that the user knows what's going on. This way we create the search
dialog between the user and the data.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

* how to add a SearchBox to make queries into the records

* how to highlight the matched part of the results

* the importance of highlighting in a text-based search
  </div>

## Add RefinementList

While the SearchBox is the way to go when it comes to textual search, you
may also want to provide filters based on the structure of the records.

Algolia provides a set of parameters for filtering by facets, numbers or geo
location. Instantsearch packages those into a set of widgets and connectors.

Since the dataset used here is an e-commerce one, let's add a [RefinementList](widgets/RefinementList.html)
to filter the products by categories:

```jsx
// We need to add the RefinementList to our import
import {
  InstantSearch,
  Hits,
  SearchBox,
  Highlight,
  RefinementList
} from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className="container">
      <SearchBox />
      <RefinementList attribute="category" />
      <Hits hitComponent={Product} />
    </div>
  );
}
```

The `attribute` props specifies the faceted attribute to use in this widget. This
attribute should be declared as a facet in the index configuration as well.

The values displayed are computed by Algolia from the results.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

* there are components for all types of refinements

* the RefinementList works with facets

* facets are computed from the results
  </div>

## Refine the search experience further

We now miss two elements in our search interface:

* the ability to browse beyond the first page of results
* the ability to reset the search state

Those two features are implemented respectively with the [Pagination](widgets/Pagination.html), [ClearRefinements](widgets/ClearRefinements.html)
and [CurrentRefinements](widgets/CurrentRefinements.html) widgets. Both have nice defaults which means that
we can use them directly without further configuration.

```jsx
// We need to add the RefinementList to our import
import {
  InstantSearch,
  Hits,
  SearchBox,
  Highlight,
  RefinementList,
  Pagination,
  CurrentRefinements,
  ClearRefinements
} from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className="container">
      <CurrentRefinements />
      <ClearRefinements />
      <SearchBox />
      <RefinementList attribute="category" />
      <Hits hitComponent={Product} />
      <Pagination />
    </div>
  );
}
```

Current filters will display all the filters currently selected by the user.
This gives the user a synthetic way of understanding the current search. `ClearRefinements`
displays a button to remove all the filters.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

* how to clear the filters

* how to paginate the results
  </div>

## Next steps

At this point, you know the basics of React InstantSearch. Read the guide to know and do more with it.

<div class="guide-nav">
  <div class="guide-nav-right">
    Next: <a href="guide/"> Guide →</a>
  </div>
</div>
