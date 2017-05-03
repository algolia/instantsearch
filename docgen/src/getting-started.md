---
title: Getting started
layout: main.pug
name: getting-started
category: getting-started
withHeadings: true
navWeight: 100
---

## Welcome to InstantSearch.js

**instantsearch.js** is a JavaScript library that lets you create an instant search results experience using Algolia’s REST API.

In this tutorial, you'll lean how to:

  * import `instantsearch.js` on your website
  * display results from Algolia
  * add widget to filter the results

## Before we start

**instantsearch.js** is meant to be used with Algolia.

Therefore, you'll need the credentials to an Algolia index. To ease this getting started, here are credentials to an already configured index:

  * `appId: latency`
  * `searchKey: 3d9875e51fbd20c7754e65422f7ce5e1`
  * `indexName: bestbuy`

It contains sample data for an e-commerce website.

This guide also expects you to have a working website. You can also use our bootstrapped project by clicking this link.


## Install `instantsearch.js`

### From a CDN

Use a built bersion of **instantsearch.js** from the [jsDeliver](https://www.jsdelivr.com/) CDN:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.css">
<script src="https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.js"></script>
```

You will then have access to the `instantsearch` function in the global scope (window).

The jsDeliver CDN is highly available with [over 110 locations](https://www.jsdelivr.com/features/network-map) in the world.

### From NPM

If you have a JavaScript build system, you can install **instantsearch.js** from NPM:

```javascript
// npm install instantsearch.js --save

var instantsearch = require('instantsearch.js');
```

You need to manually load the companion [CSS file](http://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.css) into your page.

### Bower

Use jsDelivr build to install with bower:

```shell
bower install https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.js
```


## Initialization

To initialize the instantsearch.js library, you need an Algolia account with a configured and non-empty index.

```javascript
var search = instantsearch({
  appId: 'latency',
  apiKey: '3d9875e51fbd20c7754e65422f7ce5e1',
  indexName: 'bestbuy',
  urlSync: true
});
```

`appId`, `apiKey` and `indexName` are mandatory. Those props are the credentials of your application in Algolia. They can be found in your [Algolia dashboard](https://www.algolia.com/api-keys).

You can synchronise the current search with the browser url. It provides two benefits:

  * Working back/next browser buttons
  * Copy and share the current search url

To configure this feature, pass `urlSync: true` option to `instantsearch()`.The urlSync option has more parameters [add link to params doc]

Congrats 🎉 ! Your website is now connected to Algolia.


## Display results

The core of a search experience is to display results. By default, **instantsearch.js** will do a query at the start of the page and will retrieve the most relevant hits.

To display results, we are gonna use the Hits widget. This widget will display all the results returned by Algolia, and it will update when there are new results.

```html
<div id="hits">
  <!-- Hits widget will appear here -->
</div>

<script>
  var search = instantsearch(options);

  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      hitsPerPage: 6
    })
  );
</script>
```

You should now be able to see the results without any styling. This view lets you inspect the values that are retrieved from Algolia, in order to build your custom view.

In order to customize the view for each product, we can use a special option of the Hit widget: `templates`. This option accepts a [Mustache](https://community.algolia.com/instantsearch.js/documentation/) template string or a function returning a string.

```html
<div id="hits">
  <!-- Hits widget will appear here -->
</div>

<script>
  var search = instantsearch(options);

  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      templates: {
        empty: 'No results',
        item: '<strong>Hit {{objectID}}</strong>: {{{_highlightResult.name.value}}}'
      },
      hitsPerPage: 6
    })
  );
</script>
```

In this section we’ve seen:

  * how to display the results from Algolia
  * how to customize the display of those results


## Add a SearchBox

Now that we’ve added the results, we can start querying our index. To do this, we are gonna use the Searchbox widget. Let’s add it in the html page that we created before:

```html
<div id="search-box">
  <!-- SearchBox widget will appear here -->
</div>

<div id="hits">
  <!-- Hits widget will appear here -->
</div>

<script>
  var search = instantsearch(options);

  // initialize SearchBox
  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
      placeholder: 'Search for products'
    })
  );

  // initialize hits widget
  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      hitsPerPage: 6
    })
  );
</script>
```

The search is now interactive and we see what matched in each of the products. Good thing for us, Algolia computes the matching part. For better control over what kind of data is returned, you should configure the [attributeToRetrieve](https://www.algolia.com/doc/rest#param-attributesToRetrieve) and [attributeToHighLight](https://www.algolia.com/doc/rest#param-attributesToHighlight) of your index


## Add RefinementList

While the SearchBox is the way to go when it comes to textual search, you may also want to provide filters based on the structure of the records.

Algolia provides a set of parameters for filtering by facets, numbers or geo location. **instantsearch.js** packages those into a set of widgets and connectors.

Since the dataset used here is an e-commerce one, let’s add a [RefinementList](https://community.algolia.com/instantsearch.js/documentation/#refinementlist) to filter the products by categories:

```html
<div id="search-box">
  <!-- SearchBox widget will appear here -->
</div>

<div id="refinement-list">
  <!-- RefinementList widget will appear here -->
</div>

<div id="hits">
  <!-- Hits widget will appear here -->
</div>

<script>
  var search = instantsearch(options);

  // initialize RefinementList
  search.addWidget(
    instantsearch.widgets.refinementList({
      container: '#refinement-list',
      attributeName: 'category'
    })
  );

  // initialize SearchBox
  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
      placeholder: 'Search for products'
    })
  );

  // initialize hits widget
  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      hitsPerPage: 6
    })
  );
</script>
```

The `attributeName` option specifies the faceted attribute to use in this widget. This attribute should be declared as a facet in the index configuration as well.

The values displayed are computed by Algolia from the results.

In this part, we’ve seen the following:

  * there are components for all types of refinements
  * the RefinementList works with facets
  * facets are computed from the results


## Refine the search experience further

We now miss two elements in our search interface:

  * the ability to browse beyond the first page of results
  * the ability to reset the search state

Those two features are implemented respectively with the [pagination](https://community.algolia.com/instantsearch.js/documentation/#pagination), [clearAll](https://community.algolia.com/instantsearch.js/documentation/#clearall) and [currentRefinedValues](https://community.algolia.com/instantsearch.js/documentation/#currentrefinedvalues) widgets. Both have nice defaults which means that we can use them directly without further configuration.

```html
<div id="current-refined-values">
  <!-- CurrentRefinedValues widget will appear here -->
</div>

<div id="clear-all">
  <!-- ClearAll widget will appear here -->
</div>

[ ... ]

<div id="pagination">
  <!-- Pagination widget will appear here -->
</div>

<script>
  var search = instantsearch(options);

  // initialize currentRefinedValues
  search.addWidget(
    instantsearch.widgets.currentRefinedValues({
      container: '#current-refined-values',
      // This widget can also contain a clear all link to remove all filters,
      // we disable it in this example since we use `clearAll` widget on its own.
      clearAll: false
    })
  );

  // initialize clearAll
  search.addWidget(
    instantsearch.widgets.clearAll({
      container: '#clear-all',
      templates: {
        link: 'Reset everything'
      },
      autoHideContainer: false
    })
  );

  // initialize pagination
  search.addWidget(
    instantsearch.widgets.pagination({
      container: '#pagination',
      maxPages: 20,
      // default is to scroll to 'body', here we disable this behavior
      scrollTo: false
    })
  );

  [...]
</script>
```

Current filters will display all the filters currently selected by the user. This gives the user a synthetic way of understanding the current search. `clearAll` displays a button to remove all the filters.

In this part, we’ve seen the following:

  * how to clear the filters
  * how to paginate the results
