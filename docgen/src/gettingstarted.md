---
title: Getting started
layout: getting-started.pug
category: gettingstarted
---

## Welcome to react-instantsearch

React-instantsearch is the ultimate toolbox for creating instant search
experience using [React](https://facebook.github.io/react/) and Algolia.

In this tutorial, you'll learn how to:

 - add react-instantsearch in your [React](https://facebook.github.io/react/) project
 - bootstrap react-instantsearch
 - display results from Algolia
 - add components to filter the results
 - connect your own component to the search

## Before we start

As mentionned earlier, react-instantsearch is meant to be used with Algolia.

Therefore, you'll need the credentials to an Algolia index. Here are
the credentials to an already configured index:
 - `appId`: `latency`
 - `searchKey`: `3d9875e51fbd20c7754e65422f7ce5e1`
 - `indexName`: `bestbuy`

It contains data for an e-commerce website.

This guide also expects you to have a working [React](https://facebook.github.io/react/) project. To follow this
guide in the best conditions, we suggest you use
[create-react-app](https://github.com/facebookincubator/create-react-app#getting-started) which
is the official React-CLI from Facebook.

## Install react-instantsearch

react-instantsearch is available on [npm](https://www.npmjs.com). To install it you just need
to type this command in your shell:

```sh
npm install --save react-instantsearch
```

## Add the InstantSearch wrapper

The [instantsearch](/component/InstantSearch.html) wrapper is the component that will connect to Algolia
and that will synchronise all the widgets together. It maintains the state
of the search, do the queries and provide the results to the widgets so
that they can update themselves if needed.

```javascript
import React from 'react';

import {InstantSearch} from 'react-instantsearch/dom';

const App = () =>
  <InstantSearch
    appId={appId}
    apiKey={apiKey}
    indexName={indexName}
  >
   // The instantsearch components will go here
  </InstantSearch>

// Needed only if you're js app doesn't do it already.
// Create-react-app does it for you ;)
React.render(<App />, document.querySelector('#app'));
```

`appId`, `apiKey` and `indexName` are mandatory. Those props are the
credentials of your application in Algolia. They can be found in your [Algolia
dashboard](https://www.algolia.com/api-keys).

Congratulations 🎉  Your application is now connected to Algolia! This wrapper
will provide a context so that the instantsearch components you add inside
can interact with the search.

In this section we've seen:
 - how to connect a part of a [React](https://facebook.github.io/react/) application to Algolia
 - configure your credentials with react-instantsearch

 > To get more *under the hood* information about the `InstantSearch` wrapper
 > component, we have [full documentation](/component/InstantSearch.html) in the widget
 > section.

## Display the results

The core of a search experience is to display results. By default, react-instantsearch
will do a query at the start of the page.

The next widget we want to use is the [Hits](component/Hits.html) widget. This widget will
display all the results returned by Algolia, and it will update when there
are new results.

And while we're doing that, let's create a new component for the search:

```javascript
// First, we need to add the Hits component to our import
import {InstantSearch, Hits} from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className='container'>
      <Hits />
    </div>
  );
}
```

We can then call this component in the render of App:

```javascript
const App = () =>
  <InstantSearch
    appId={appId}
    apiKey={apiKey}
    indexName={indexName}
  >
   <Search/>
  </InstantSearch>
```

You should now be able to see the results without any styling. This
view lets you inspect the values that are retrieved from Algolia, in order
to build your custom view.

In order to customize the view for each product, we can use a special prop
of the Hit component: `itemComponent`. This props accept a Component that
will be used for each hit in the results from Algolia.

```javascript
function Product({hit}) {
  return (
    <div>
      <span className="hit-name">{hit.name}</span>
    </div>
  );
};
```

The component receives a prop `hit` that contains the content of the
record. Here we are only displaying the name for the sake of simplicity
but there is no limit as long as the data in the record.

Now let's modify the `Hits` usage to add our new `itemComponent`.

```javascript
function Search() {
  return (
    <div className="container">
      <Hits itemComponent={Product} />
    </div>
  );
}
```

In this section we've seen:
 - how to display the results from Algolia
 - how to customize the display of those results

## Add a SearchBox

Now that we've added the results, we can start querying our index and filtering it
to extract the meaningful records. With Algolia, the main way to filter the records
into hits, is the text search.

To implement this, react-instantsearch provides the [Searchbox](component/SearchBox.html) component. Let's add it
in the Search component that we created before:

```javascript
// We need to add the SearchBox to our import
import {InstantSearch, Hits, SearchBox} from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className='container'>
      <SearchBox />
      <Hits itemComponent={Product} />
    </div>
  );
}
```

The search is now interactive but we don't see what matched in each of the products.
Good thing for us, Algolia computes the matching part. Let's add this to our custom
search result component:

```javascript
// We need to add the highlight function to our import
import {InstantSearch, Hits, SearchBox, highlight} from 'react-instantsearch/dom';

// [...]

function Product({hit}) {
  return (
    <div>
      <span className="hit-name">{highlight('name', hit)}</span>
    </div>
  );
};
```

Now the search displays the results and hightlights the part of the hit attribute
that matches the query. This pattern is very important in search, especially with
Algolia, so that the user knows what's going on. This way we create the search
dialog between the user and the data.

In this part, we've seen the following:
 - how to add a SearchBox to make queries into the records
 - how to highlight the matched part of the results
 - the importance of highlighting in a text-based search

## Add some filters

While the SearchBox is the way to go when it comes to textual search, you
may also want to provide filters based on the structure of the records.

Algolia provides a set of parameters for filtering by facets, numbers or geo
location. Instantsearch packages those into a set of components and connector.

Since the dataset used here is an e-commerce one, let's add a [RefinementList](component/RefinementList.html)
to filter the products by categories:

```javascript
// We need to add the RefinementList to our import
import {InstantSearch, Hits, SearchBox, hightlight, RefinementList} from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className='container'>
      <SearchBox />
      <RefinementList attributeName="category" />
      <Hits itemComponent={Product} />
    </div>
  );
}
```

The `attributeName` props specifies the faceted attribute to use in this widget. This
attribute should be declared as a facet in the index configuration as well.

The values displayed are computed by Algolia from the results.

In this part, we've seen the following:
 - there are components for all types of refinements
 - the RefinementList works with facets
 - facets are computed from the results

## Refine the search experience further

We now miss two elements in our search interface:
 - the ability to browse beyond the first page of results
 - the ability to reset the search state

Those two features are implemented respectively with the [Pagination](component/Pagination.html), the [ClearAll](component/ClearAll.html)
and [CurrentRefinements](component/CurrentRefinements.html) components. Both have nice defaults which means that
we can use them directly without further configuration.

```javascript
// We need to add the RefinementList to our import
import {InstantSearch, Hits, SearchBox, hightlight, RefinementList, Pagination, CurrentRefinements, ClearAll} from 'react-instantsearch/dom';

// [...]

function Search() {
  return (
    <div className='container'>
      <CurrentRefinements/>
      <ClearAll/>
      <SearchBox />
      <RefinementList attributeName="category" />
      <Hits itemComponent={Product} />
      <Pagination />
    </div>
  );
}
```

Current filters will display all the filters currently selected by the user.
This gives the user a synthetic way of understanding the current search. `ClearAll`
displays a button to remove all the filters.

In this part, we've seen the following:
 - how to clear the filters
 - how to paginate the results

## Next steps

At this point, you know all the basics of react-instantsearch. All the
components can be customised further using connectors, like
in the paragraph about displaying the results.

Here are some suggested guides and references that you might be interested in:
 - [How to style your search](/guides/styling.html)
 - [Advanced examples using react-instantsearch](examples.html)
 - [The API for widgets and components](component.html)
 - [All the other guides](guides.html)
