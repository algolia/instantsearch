---
layout: documentation.pug
title: Getting started with the helper
---

## Before we start

The Helper has been made to create search-based applications. It will help you structure the search of your app with a rock solid foundation, and enhance it with advanced search features. Compared to the JS client, the Helper is focused on providing search only features, and provides an higher level API which will give you an easy access to advanced search filters.

This **getting started** will show you how to:

- integrate the helper in a webpage
- build a complete search-as-you-type experience without a JS framework
- use advanced Algolia filtering
- build the according UI

The getting started will use jQuery for the sake of simplicity. However, the Helper is agnostic and can also be used with other frameworks or libraries.

In order to follow this tutorial you need to have access to an Algolia index. The easiest way to follow this tutorial is by using the provided credentials, using our ecommerce dataset. You can also adapt it to your own dataset.

> In order to use the full power of Algolia in the most efficient manner we have created [InstantSearch.js](https://community.algolia.com/instantsearch.js/v2/) and [react-instantsearch](https://community.algolia.com/react-instantsearch/) to quickly build search UIs.

### Using the provided dataset

For the purpose of this tutorial, we'll use our ecommerce dataset. For further reference, here are the credentials that we're going to use:

- `applicationID`: `latency`
- `apiKey`: `249078a3d4337a8231f1665ec5a44966`
- `indexName`: `bestbuy`

[Let's get started](#integrate)

### Using your dataset

You need an [Algolia account](https://www.algolia.com/users/sign_up). You also need to [upload a dataset](https://www.algolia.com/doc/indexing/import-synchronize-data/javascript#importing-data) and your [search credentials](https://www.algolia.com/api-keys). Here are the elements you need for the rest of the tutorial:

- the application ID (referred later as `applicationID`)
- the search API key (referred later as `apiKey`)
- the index name (referred later as `indexName`)

You can still use the [provided Algolia index](#using-the-provided-dataset), if you prefer. Otherwise, let's proceed with the setup of the library in the application.

## Integrate

The helper is available on different platforms. You can use it as a script or npm. As the helper extends the client, we need to import both of them.

### Script tag

Using scripts, you can import the helper directly in your webpage. You will also need to import the [Algolia JS client](https://github.com/algolia/algoliasearch-client-js). To import the libraries, add those lines in your page:

```html
<script src="https://cdn.jsdelivr.net/npm/algoliasearch@3/dist/algoliasearchLite.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/algoliasearch-helper@{{pkg.version}}/dist/algoliasearch.helper.min.js"></script>
```

### npm

In an npm project, include the project with this command:

`npm install --save algoliasearch algoliasearch-helper`

You can also use Yarn:

`yarn add algoliasearch algoliasearch-helper`

## First search

The first step toward searching in your index is to initialize the client and provide it to the helper factory.

```javascript
/* if you use npm, you also need to add the correct requirements
var algoliasearch = require('algoliasearch');
var algoliasearchHelper = require('algoliasearch-helper');
*/
var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, indexName);
```

Once you've added those lines, you need to listen to the results coming from Algolia. For now, we'll implement a very basic display of the JSON response in the page.

```javascript
helper.on('result', function (event) {
  renderHits(event.results);
});

function renderHits(content) {
  $('#container').html(JSON.stringify(content, null, 2));
}
```

At this point, we have no results yet. It's because we didn't trigger any search. For now, we will do an _empty search_ on your index. This will return the results ordered according to the [custom ranking](https://www.algolia.com/doc/guides/relevance/ranking#custom-ranking). Let's see how to trigger the search:

```javascript
helper.search();
```

The `search` method of the helper triggers the search with the current parameters saved in the helper. For the moment we have none, therefore the results contains the first records ordered by the [custom ranking](https://www.algolia.com/doc/guides/relevance/ranking#custom-ranking).

{{{codepen "AXbmEX" 300}}}

<div class='chapter-summary'>

You now know:

- how to **instantiate** the helper
- **listen** to the `result` event and **read the results** from Algolia
- **trigger a search** to algolia

</div>

## Setting the query

The empty search is a great tool to display the first step of a search but it is not what our users are looking for. They want to search in your data. Let's see how to add a search input to let our users do a textual search in the data.

Before going further, let's customize a little bit the display of our results. We're going to focus on the actual results computed by Algolia. The results are returned in the `hits` attribute of the `results`. Let's display only the `name` of each product for now.

```javascript
helper.on('result', function (event) {
  renderHits(event.results);
});

function renderHits(content) {
  $('#container').html(function () {
    return $.map(content.hits, function (hit) {
      return '<li>' + hit.name + '</li>';
    });
  });
}
```

Now that we have filtered the information displayed, let's add our search input:

```html
<input type="text" autocomplete="off" id="search-box" />
```

And now let's listen to the changes to this input, so that we can update the query and trigger a new search.

```javascript
$('#search-box').on('keyup', function () {
  helper.setQuery($(this).val()).search();
});
```

When calling `setQuery`, we change the value of the query inside the helper. But this does not trigger the search, we need to trigger it manually, that's why we call `search` afterwards.

To help our users better understand the results, let's use the highlighted results returned by Algolia. This way the users can easily understand why the results match their query.

```javascript
helper.on('result', function (event) {
  renderHits(event.results);
});

function renderHits(content) {
  $('#container').html(function () {
    return $.map(content.hits, function (hit) {
      return '<li>' + hit._highlightResult.name.value + '</li>';
    });
  });
}
```

The object `_highlightResult` contains all the attributes that may be highlighted (by default, all the searchable attributes).

{{{codepen "VjAVjX" 300}}}

<div class='chapter-summary'>

In this part, we have seen:

- how to **set the query** of the search
- how to **trigger the search**
- how to **display highlighting** to help our users
- how to plug all these to make an interactive search

</div>

## Adding facets

A facet is a filter that can be used to restrict the results to specific values of an attribute. For example, in our records we have an attribute `type`, with a facet we can restrict the results to only `movie`. This way the results returned by Algolia will only be those for which the attribute `type` has `movie` as a value.

If you're using your own data in this tutorial, you must add the attributes you want to facet in the [display configuration of your index](https://www.algolia.com/explorer#?tab=display). By the way, we also have a complete documentation [on this subject](https://www.algolia.com/doc/guides/search/filtering-faceting#faceting).

First we should declare that we want to use the attribute `type` as a facet. This is done during the initialization of the helper.

```javascript
var helper = algoliasearchHelper(client, indexName, {
  facets: ['type'],
});
```

The list of available facets is returned by the Algolia API. This list is dynamic and should be updated at each new results. So that's why we render this list each time we receive new results. This list also lets our user select a value, so we should also make it so that it's possible using jQuery.

```javascript
$('#facet-list').on('click', 'input[type=checkbox]', function (e) {
  var facetValue = $(this).data('facet');
  helper.toggleFacetRefinement('type', facetValue).search();
});

function renderFacetList(content) {
  $('#facet-list').html(function () {
    return $.map(content.getFacetValues('type'), function (facet) {
      var checkbox = $('<input type=checkbox>')
        .data('facet', facet.name)
        .attr('id', 'fl-' + facet.name);
      if (facet.isRefined) checkbox.attr('checked', 'checked');
      var label = $('<label>')
        .html(facet.name + ' (' + facet.count + ')')
        .attr('for', 'fl-' + facet.name);
      return $('<li>').append(checkbox).append(label);
    });
  });
}
```

The method [getFacetValues](reference.html#SearchResults#getFacetValues) returns the list of values usable to filter an attribute. The object returned by this method contains three properties:

- `name`: the value of the facet
- `count`: the number of items in the whole results
- `isRefined`: is this value already selected

Let's add the rendering of the facet list into the `result` handler.

```javascript
helper.on('result', function (event) {
  renderFacetList(event.results);
  renderHits(event.results);
});
```

We now have a menu displaying the values that the user can choose from to filter the list of results. Those values are generated by Algolia based on the rest of the search, meaning that it will only provide facet values that are meaningful for the current other parameters. Try typing _apple_ and the filter item _movie_ will be removed.

This kind of facets are called _conjunctive facets_ but they are not the only kind of filtering that you can apply with the helper. You can also do:

- disjunctive faceting (for making multiple choices filters)
- hierarchical faceting (for making hierarchical navigations)
- numerical filtering
- tag filtering

{{{codepen "ZOamyB" 300}}}

<div class='chapter-summary'>

In this part, we have seen:

- how to **declare a facet** in the configuration of the helper
- how to **display the facet values** computed by the API
- how to **refine a facet**

</div>

## Going further

Congratulations! You now know the basics of the Helper. You should, by now, have a better overview of the kind of features available in the Helper, as well as the mechanics involved.

Here are some pointers on where to go next:

- [the instantsearch tutorial](https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/), for a more in-depth UI/UX oriented tutorial
- [the reference documentation](reference.html), to see the whole possibilities of the Helper API
- [the examples](examples.html), to see how to implement common patterns using the Helper
- [the concepts](concepts.html), for a more high level presentation of the Helper API

Last but not least, the Helper is an intermediate API on top of the client and it doesn't solve the UI complexity on its own. If you're looking for a more off-the-shelf solution, we created [instantsearch.js](https://community.algolia.com/instantsearch.js/) which reuses the helper internally.
