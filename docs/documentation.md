---
layout: documentation
title: Documentation
permalink: /documentation/
noFooter: true
---

{::options parse_block_html="true" /}

## Introduction

<div class="shameless-marketing text-center hidden-xs">
<img src="{% asset_path logo-instantsearch.svg %}" height="40" alt="logo instantsearch.js"/>
<div class="lead">
  <p>Build the perfect UI with instantsearch.js,<br> a library of widgets designed to help you create a high-performance instant-search experience.</p>
  <p class="version">Version: <strong>{{ site.version }}</strong></p>
</div>
<div class="spacer40"></div>
<div class="row">
<div class="col-md-4 m-b">
<div class="sticker sticker-algolia">
<img src="{% asset_path logo-algolia-notext.svg %}" width="26"/>
</div>
Built on top of the <a href="https://www.algolia.com/?utm_medium=social-owned&utm_source=instantsearch.js%20website&utm_campaign=homepage">Algolia Search API</a>
</div>
<div class="col-md-4 m-b">
<div class="sticker sticker-open-source">
<img src="{% asset_path logo-open-source.svg %}" width="30"/>
</div>
Community driven and available on <a href="https://github.com/algolia/instantsearch.js">Github</a>
</div>
<div class="col-md-4 m-b">
<div class="sticker sticker-ux">
<img src="{% asset_path logo-UX.svg %}" width="30"/>
</div>
UI/UX best practices
</div>
</div>
</div>

**instantsearch.js** is a JavaScript library that lets you create an instant search results experience using Algolia's REST API.

A search results page is made up of individual components, also known as widgets. Widgets are UI components for either the search input (search bar, facets/filters, etc.) or the search output (actual results).

Each widget is independent, and their rendering is bound to the search. They follow the **instantsearch.js** lifecycle:

  - **Configuration**: each widget adds new query parameters to the underlying Algolia API client.
  - **Initial rendering**: before the initial search, the widget may update the UI.
  - **Rendering**: on each search, after the results come back from Algolia, the widgets update themselves.

The library is open-source, based on [React.js](https://facebook.github.io/react/) and hosted on GitHub: [<i class="fa fa-github"></i> algolia/instantsearch.js](https://github.com/algolia/instantsearch.js). All contributions are welcome.

### Setup

#### From a CDN
{:.no-toc}

<div class="codebox-combo">

Use a built version of **instantsearch.js** from the [jsDelivr](https://www.jsdelivr.com/) CDN:

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight html %}
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.css">
<script src="https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.js"></script>
{% endhighlight %}
  </div>
</div>

You will then have access to the `instantsearch` function in the global scope (window).

The jsDelivr CDN is highly available with [over 110 locations](https://www.jsdelivr.com/features/network-map) in the world.

</div>

#### From NPM
{:.no-toc}

<div class="codebox-combo">

If you have a JavaScript build system, you can install **instantsearch.js** from NPM:

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight sh %}
npm install instantsearch.js --save
{% endhighlight %}
  </div>
</div>
<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight javascript %}
var instantsearch = require('instantsearch.js');
{% endhighlight %}
  </div>
</div>

You need to manually load the companion [CSS file](http://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.css) into your page.

</div>

### Initialization

<div class="codebox-combo">

To initialize the **instantsearch.js** library, you need an Algolia account with a configured and non-empty index.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet config">
{% highlight javascript %}
var search = instantsearch({
  appId: '$appId',
  apiKey: '$apiKey',
  indexName: '$indexName',
  urlSync: true
});
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch(options);
{% endhighlight %}

{% include widget-jsdoc/instantsearch.md %}
  </div>
  <div class="requirements js-toggle-requirements">
Use your **search-only API key**. Your index should also contain data.
  </div>
</div>

You can find your Algolia credentials on the [credentials page of your dashboard](https://www.algolia.com/licensing).

Use the **APPLICATION\_ID** `appId`, the **search only API\_KEY** `apiKey` and an index name `indexName` to configure the required parameters of the `instantsearch` function.

If you don't have any indices yet, learn how to push your data with the [Algolia getting started guide](https://www.algolia.com/getstarted).

**Url synchronization**

You can synchronise the current search with the browser url. It provides two benefits:

  - Working back/next browser buttons
  - Copy and share the current search url

To configure this feature, pass `urlSync: true` option to `instantsearch()`.

The `urlSync` option has more parameters, see the `instantsearch` function documentation.

</div>

### Adding Widgets

<div class="codebox-combo">

To build your search results page, you need to combine several widgets. Start by adding a `searchBox` widget, a `hits` widget and a `pagination` widget to build a basic results page.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight html %}
<div id="search-box"></div>

<script>
  // var search = instantsearch..

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
      placeholder: 'Search for products...'
    })
  );
</script>
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
search.addWidget(widget)
{% endhighlight %}

{% include widget-jsdoc/addWidget.md %}

  </div>
</div>

</div>

Note: **instantsearch.js** comes with [built-in widgets](#widgets), but you can also build your [own custom widgets](#custom-widgets).

### Start

<div class="codebox-combo">

Once all the widgets have been added to the instantsearch instance, start the rendering by calling the `start()` method.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet start">
{% highlight javascript %}
search.start();
{% endhighlight %}
  </div>
</div>

</div>

<div class="spacer50"></div>

<div class="codebox-combo">

This example shows you how to create a very simple search results page that includes a searchBox, a list of hits and a pagination widget.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight html %}
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.css" />
    <title>instantsearch.js basics</title>
  </head>
  <body>
    <input type="text" id="search-box" />
    <div id="hits-container"></div>
    <div id="pagination-container"></div>

    <script src="https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.min.js"></script>
    <script>
      var search = instantsearch({
        appId: 'YourApplicationID',
        apiKey: 'YourSearchOnlyAPIKey',
        indexName: 'YourIndexName'
      });

      search.addWidget(
        instantsearch.widgets.searchBox({
          container: '#search-box',
          placeholder: 'Search for products...'
        })
      );

      search.addWidget(
        instantsearch.widgets.hits({
          container: '#hits-container',
          templates: {
            item: 'Hit {% raw %}{{objectID}}{% endraw %}: FIXME'
          }
        })
      );

      search.addWidget(
        instantsearch.widgets.pagination({
          container: '#pagination-container'
        })
      );

      search.start();
    </script>
  </body>
</html>
{% endhighlight %}
  </div>
</div>

</div>

<div class="spacer100"></div>

<img class="img-responsive" src="{% asset_path add-widgets.jpg %}" alt="Add widgets">

### Events

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight js %}
var search = instantsearch({
  appId: '$appId',
  apiKey: '$apiKey',
  indexName: '$indexName',
  urlSync: true
});

var onRenderHandler = function() {};
search.on('render', onRenderHandler);
// on renderHandler will be called
// until removeListener is called
search.removeListener(onRenderHandler);

search.once('render', function(){  });
// triggered once then removed automatically
{% endhighlight %}
  </div>
</div>

instantsearch emits events during its lifecycle. The currently supported events are:

 - `render`: fired when a rendering of all the widgets has been completed

instantsearch events are based on the [Node EventEmitter](https://nodejs.org/api/events.html)
class. See the example for a quick overview of the API or go to the
[Node documentation](https://nodejs.org/api/events.html) for more details.


## Widgets

### Basics

#### searchBox

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-searchbox.svg %}">
The search box widget is where you users type their search queries.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#q',
    placeholder: 'Search for products',
    autofocus: false,
    poweredBy: true
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.searchBox(options)
{% endhighlight %}

{% include widget-jsdoc/searchBox.md %}

  </div>
  <div class="requirements js-toggle-requirements">
For better results, we suggest that you configure at least the
[attributeToIndex](https://www.algolia.com/doc/rest#param-attributesToIndex) and
[customRanking](https://www.algolia.com/doc/rest#param-customRanking) of your
index.
  </div>
</div>

</div>

<div id="q" class="widget-container"></div>

#### hits

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-results.svg %}">
The hits widget is the main component that displays results from Algolia. It accepts a [Mustache]() template string or a function returning a string. See the [templates](#templates) section.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
{% raw %}
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits-container',
    templates: {
      empty: 'No results',
      item: '<strong>Hit {{objectID}}</strong>: {{{_highlightResult.name.value}}}'
    },
    hitsPerPage: 6
  })
);
{% endraw %}
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
{% raw %}
instantsearch.widgets.hits(options);
{% endraw %}
{% endhighlight %}

{% include widget-jsdoc/hits.md %}

  </div>
  <div class="requirements js-toggle-requirements">
For better control over what kind of data is returned, we suggest you configure the
[attributeToRetrieve](https://www.algolia.com/doc/rest#param-attributesToRetrieve)
and
[attributeToHighlight](https://www.algolia.com/doc/rest#param-attributesToHighlight) of your index.
  </div>
</div>

</div>

<div id="hits-container" class="widget-container"></div>


#### hitsPerPageSelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-hitperpage.svg %}">
The hitsPerPageSelector widget lets you select the number of results you want
displayed at once.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
{% raw %}
search.addWidget(
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page-selector',
    options: [
      {value: 6, label: '6 per page'},
      {value: 12, label: '12 per page'},
      {value: 24, label: '24 per page'}
    ]
  })
);
{% endraw %}
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
{% raw %}
instantsearch.widgets.hitsPerPageSelector(options);
{% endraw %}
{% endhighlight %}

{% include widget-jsdoc/hitsPerPageSelector.md %}

  </div>
  <div class="requirements js-toggle-requirements">
The [hits](#hits) widget lets you define the default number of results
displayed. This value must be defined in the `options` parameter.
  </div>
</div>

</div>

<div id="hits-per-page-selector" class="widget-container"></div>

### Navigation

#### pagination

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-pagination.svg %}">
The pagination widget provides the ability to navigate through results
pages.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
    {% highlight javascript %}
search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination-container',
    maxPages: 20,
    // default is to scroll to 'body', here we disable this behavior
    scrollTo: false
  })
);
    {% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.pagination(options);
{% endhighlight %}

{% include widget-jsdoc/pagination.md %}
  </div>
</div>

</div>

<div id="pagination-container" class="text-center widget-container"></div>

#### menu

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-menu.svg %}">
The menu widget provides a way to navigate through results based on a single attribute.
Only one value can be selected at a time. This can be used for navigating through the categories
of an e-commerce website.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    attributeName: 'categories',
    limit: 10,
    templates: {
      header: 'Categories'
    }
  })
);
{% endhighlight %}
  </div>

  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.menu(options);
{% endhighlight %}

{% include widget-jsdoc/menu.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div id="categories" class="widget-container"></div>

#### hierarchicalMenu

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-hierarchical.svg %}">
The hierarchical menu is a widget that lets the user explore a tree-like structure.
This is commonly used for multi-level categorization of products on e-commerce websites.
From a UX point of view, we suggest not displaying more than two levels deep.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#hierarchical-categories',
    attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
    templates: {
      header: 'Hierarchical categories'
    }
  })
);
{% endhighlight %}
  </div>

  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.hierarchicalMenu(options);
{% endhighlight %}

{% include widget-jsdoc/hierarchicalMenu.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute used for faceting must be an object that follows a [specific
convention](https://github.com/algolia/algoliasearch-helper-js#hierarchical-facets).

For example, to build the example menu, our objects are defined like this:
{% highlight javascript %}
{
  "objectID": 4815162342,
  "hierarchicalCategories": {
    "lvl0": "Appliances"
    "lvl1": "Appliances > Air Conditioners"
    "lvl2": "Appliances > Air Conditioners > Portable Air Conditioners"
  }
}
{% endhighlight %}

All attributes (`hierarchicalCategories.lvl0/1/2`) should be defined as
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.

Each level must repeat the parent breadcrumb.

  </div>
</div>
</div>

<div id="hierarchical-categories" class="widget-container"></div>

### Filters

#### refinementList

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-refinement.svg %}">
This filtering widget lets the user refine the search results. You can specify if you want filters to be ORed or ANDed. For example, if you filter on `a` and `b` with `OR`,
results with either the value `a` or `b` will match.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    attributeName: 'brand',
    operator: 'or',
    limit: 10,
    templates: {
      header: 'Brands'
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.refinementList(options);
{% endhighlight %}

{% include widget-jsdoc/refinementList.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div id="brands" class="widget-container"></div>

#### numericRefinementList

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-numerical.svg %}">
This widget lets the user refine search results based on a numerical attribute. You can specify a specific number or a range.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.numericRefinementList({
    container: '#popularity',
    attributeName: 'popularity',
    options: [
      {name: 'All'},
      {end: 500, name: 'less than 500'},
      {start: 500, end: 2000, name: 'between 500 and 2000'},
      {start: 2000, name: 'more than 2000'}
    ],
    templates: {
      header: 'Popularity'
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.numericRefinementList(options);
{% endhighlight %}

{% include widget-jsdoc/numericRefinementList.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>


</div>

<div id="popularity" class="widget-container"></div>

#### toggle

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-toggle.svg %}">
This widget provides an on/off filtering feature based on an attribute value.
Note that if you provide an "off" option, it will be refined at initialization.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free-shipping',
    attributeName: 'free_shipping',
    label: 'Free Shipping',
    values: {
      on: true,
      off: false
    },
    templates: {
      header: 'Shipping'
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.toggle(options);
{% endhighlight %}
{% include widget-jsdoc/toggle.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div id="free-shipping" class="widget-container"></div>

#### rangeSlider

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-slider.svg %}">
The rangeSlider widget lets users filter results within a numerical range, based on an attribute.
The min and max values are automatically computed by Algolia using the data in the index.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    attributeName: 'price',
    templates: {
      header: 'Price'
    },
    tooltips: {
      format: function(rawValue) {
        return '$' + Math.round(rawValue).toLocaleString();
      }
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.rangeSlider(options);
{% endhighlight %}
{% include widget-jsdoc/rangeSlider.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.

The values inside this attribute must be JavaScript numbers and not strings.
  </div>
</div>

</div>

<div id="price" class="widget-container"></div>

#### priceRanges

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-pricerange.svg %}">
This filtering widget lets the user choose a price range. The ranges are dynamically computed based on the returned results.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.priceRanges({
    container: '#price-ranges',
    attributeName: 'price',
    labels: {
      currency: '$',
      separator: 'to',
      button: 'Go'
    },
    templates: {
      header: 'Price'
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.priceRanges(options);
{% endhighlight %}

{% include widget-jsdoc/priceRanges.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.

The values inside this attribute must be JavaScript numbers and not strings.
  </div>
</div>

</div>

<div id="price-ranges" class="widget-container"></div>

#### numericSelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-index.svg %}">
This filtering widget lets the user choose between numerical refinements from a dropdown menu.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.numericSelector({
    container: '#popularity-selector',
    attributeName: 'popularity',
    operator: '>=',
    options: [
      {label: 'Top 10', value: 9900},
      {label: 'Top 100', value: 9800},
      {label: 'Top 500', value: 9700}
    ]
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.numericSelector(options);
{% endhighlight %}

{% include widget-jsdoc/numericSelector.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.

The values inside this attribute must be JavaScript numbers and not strings.
  </div>
</div>

</div>

<div id="popularity-selector" class="widget-container"></div>

#### starRating

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-star-rating.svg %}">
This widget lets the user refine search results by clicking on stars. The stars are based on the selected `attributeName`. The underlying rating attribute needs to have from 0 to `max` stars.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.starRating({
    container: '#stars',
    attributeName: 'rating',
    max: 5,
    labels: {
      andUp: '& Up'
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.starRating(options);
{% endhighlight %}

{% include widget-jsdoc/starRating.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.

The values inside this attribute must be JavaScript numbers and not strings.
  </div>
</div>

</div>

<div id="stars" class="widget-container"></div>

#### clearAll

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-clearall.svg %}">
This widget clears all the refinements that are currently applied.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear-all',
    templates: {
      link: 'Reset everything'
    },
    autoHideContainer: false
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.clearAll(options);
{% endhighlight %}

{% include widget-jsdoc/clearAll.md %}
  </div>
</div>

</div>

<div id="clear-all" class="widget-container"></div>

#### currentRefinedValues

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-clearall.svg %}">
This widget list all the refinements currently applied. It also lets
the user clear them one by one. This widget can also contain a
`clear all` link to remove all filters.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: '#current-refined-values',
    clearAll: 'after'
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.currentRefinedValues(options);
{% endhighlight %}

{% include widget-jsdoc/currentRefinedValues.md %}
  </div>
</div>

</div>

<div id="current-refined-values" class="widget-container"></div>


### Sort

#### sortBySelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-index.svg %}">
This widget lets you reorder your results. You need multiple indices for this to work. See requirements.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.sortBySelector({
    container: '#sort-by-container',
    indices: [
      {name: 'instant_search', label: 'Most relevant'},
      {name: 'instant_search_price_asc', label: 'Lowest price'},
      {name: 'instant_search_price_desc', label: 'Highest price'}
    ]
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.sortBySelector(options);
{% endhighlight %}
{% include widget-jsdoc/sortBySelector.md %}
  </div>
  <div class="requirements js-toggle-requirements">
You must have slave indices for every sort order you need. Then
configure their `ranking` to use a custom attribute as the first criterion.

Find detailed explanations [in our FAQ
page](https://www.algolia.com/doc/faq/index-configuration/how-to-sort-the-results-with-a-specific-attribute).
  </div>
</div>

</div>

<div id="sort-by-container" class="widget-container"></div>

### Metadata

#### stats

<div class="codebox-combo">

<img class="widget-icon pull-left" src="{% asset_path icon-widget-stats.svg %}">
This widget lets you display how many results matched the query and how fast the search was.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats-container'
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc">
{% highlight javascript %}
instantsearch.widgets.stats(options);
{% endhighlight %}

{% include widget-jsdoc/stats.md %}
  </div>
</div>

</div>

<div id="stats-container" class="widget-container"></div>

## FAQ

### Default filters

<div class="codebox-combo">
<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
var search = instantsearch({
  [...],
  searchParameters: {
    facetsRefinements: {
      categories: ['Cell Phones'],
      isPremium: [true]
    },
    disjunctiveFacetsRefinements: {
      brand: ['Samsung', 'Apple']
    },
    // Add to "facets" all attributes for which you
    // do NOT have a widget defined
    facets: ['isPremium']
  },
});
// Below is just a common widget configuration, to show
// how it interacts with the above searchParameters
search.addWidget(
  instantsearch.widgets.menu({
    [...],
    attributeName: 'categories'
  })
);
search.addWidget(
  instantsearch.widgets.refinementList({
    attributeName: 'brand',
    operator: 'or'
  })
);
{% endhighlight %}
  </div>
</div>

Sometimes you might want to automatically add some filters on the first page
load. Maybe automatically filter on `Cell Phones` made by either `Samsung` or
`Apple`, or only display items that are somehow "premium".

If you are already using a widget to perform a filter on that attribute (like
the `menu` or `refinementList` widgets), you can just use the
`searchParameters.facetsRefinements` attribute option when instantiating instantsearch.

Pass it an object where each key is the attribute you want to filter and each
value is an array of the filtered values.  If you are using `OR` filters instead
of `AND`, then just use `disjunctiveFacetsRefinements` in place of
`facetsRefinements`.

If you want to filter on an attribute for which you're not using a widget, you
will have to also pass the `facets` key to the `searchParameters` with an array
containing the name of your attribute. Use `disjunctiveFacets` instead of
`facets` if you'd like to do an `OR` instead of an `AND`. Note that you still
need to add the attribute to the
[attributesForFacetting](https://www.algolia.com/doc/rest#param-attributesForFaceting)
in your index configuration.

</div>

### Hide results on init

<div class="codebox-combo">
<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
var search = instantsearch({
  [...],
  searchFunction: function(helper) {
    var searchResults = $('.search-results');
    if (helper.state.query === '') {
      searchResults.hide();
      return;
    }
    helper.search();
    searchResults.show();
  }
}
{% endhighlight %}
  </div>
</div>

By default, the library will do an empty query (`''`) on startup and display the
results for this query. If you'd like to display results only when users
actually start typing, you can use the `searchFunction` hook.

This method takes only one argument, `helper`, on which you can call `.search()`
to actually start the search.  `helper.state` also contains information about
the current state of your search.

You can for example check for `helper.state.query` to see if the query is empty
or not, and act accordingly. You might also have to handle the case when users
start typing, then delete their query and hide the results when that happens.

Note that for the sake of brevity, we use a jQuery-like syntax in the example,
but any other method to show/hide the results would work.

</div>

## Community widgets

Community widgets are solving specific use cases and so cannot make it into the core instantsearch.js library.

You may want to create and publish your own community widget, we have a [dedicated section](#custom-widgets) on how to create them.

If you want your widget to be listed here, [open an issue](https://github.com/algolia/instantsearch.js/issues).

### googleMaps

The [googleMaps](https://github.com/instantsearch/instantsearch-googlemaps) widget can display your [Algolia geo hits](https://www.algolia.com/doc/rest#geo-search-parameters) on a map using [Google Maps APIs](https://developers.google.com/maps/).

**Widget demo**:
<img src="{% asset_path googleMaps.gif %}" width="100%" />

See the [full documentation](https://github.com/instantsearch/instantsearch-googlemaps#readme).

### ionRangeSlider

Provides [Ion.RangeSlider](https://github.com/IonDen/ion.rangeSlider) as a widget. This is a jQuery plugin so you will need to use jQuery in your page.

**Widget demo**:
<img src="{% asset_path ionRangeSlider.gif %}" width="100%" />

See the [full documentation](https://github.com/instantsearch/instantsearch-ion.rangeSlider#readme).

## Templates

<div class="codebox-combo">
<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
// Mustache template example
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    templates: {
      body: '{% raw %}<div>You have {{nbHits}} results, fetched in {{processingTimeMS}}ms.</div>{% endraw %}'
    }
  })
);

// Function template example
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    templates: {
      body: function(data) {
        return '<div>You have ' + data.nbHits + ' results, fetched in ' +
          data.processingTimMS +'ms.</div>'
      }
    }
  })
);
{% endhighlight %}
  </div>
</div>

  Most of the widgets accept a template or templates option that let you change the default rendering. Templates can be defined either as a [Mustache](https://mustache.github.io/) string or as a function receiving the widget data and returning either a string or a React element.

  See the documentation of each widget to see which data is passed to the template.
</div>

### Helpers

<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
search.templatesConfig.helpers.emphasis = function(text, render) {
  return '<em>' + render(text) + '</em>';
};
{% endhighlight %}
  </div>
  <div class="code-sample-snippet ignore">
  <strong class="text-white">In your helper, `this` always refers to the data</strong>
{% highlight javascript %}
search.templatesConfig.helpers.discount = function(/*text, render*/) {
  var discount = this.price * 0.3;
  return '$ -' + discount;
};
{% endhighlight %}
  </div>
</div>

In order to help you use templates, **instantsearch.js** exposes a few helpers.

All helpers are accessible in the Mustache templating through `{% raw %}{{#helpers.nameOfTheHelper}}{{valueToFormat}}{{/helpers.nameOfTheHelper}}{% endraw %}`. To use them in the function templates, you'll have to call `search.templatesConfig.helpers.nameOfTheHelper` where `search` is your current **instantsearch.js** instance.

Currently we have one helper:

`formatNumber`: Will accept a number as input and return the formatted version of the number in the locale defined with the `numberLocale` config option (defaults to `en-EN`). eg. `100000` will be formatted as `100 000` with `en-EN`

### Options

<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
var search = instantsearch({
  appId: '',
  apiKey: '',
  indexName: '',
  templatesConfig: {
    compileOptions: {
      // all the Hogan compile options
    }
  }
});
{% endhighlight %}
  </div>
</div>

You can configure the options passed to underlying `Hogan.compile` by using `search.templatesConfig.compileOptions`. We accept all [compile options](https://github.com/twitter/hogan.js/#compilation-options).

Theses options will be passed to the `Hogan.compile` calls when you pass a custom template.


## Customize

### Custom widgets

<div class="codebox-combo">

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight javascript %}
var customWidget = {
  getConfiguration: function(searchParams) {
    return {
      // see "Usage" tab for more details on the API
    };
  },

  init: function(options) {
    // see "Usage" tab for more details on the API
  },

  // Called every time there is new data
  render: function(options) {
    // see "Usage" tab for more details on the API
  }
};

search.addWidget(customWidget);
{% endhighlight %}

  </div>
  <div class="jsdoc js-toggle-jsdoc">

{% highlight javascript %}
search.addWidget(widget)
{% endhighlight %}

The widget may implement some of the following methods (depending on the need of the widget):

  - <span class="attr-optional">`widget.getConfiguration`</span>: Configures the underlying AlgoliaSearch JS helper. Takes a [SearchParameter](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html) and should return the properties needed as an object.
  - <span class="attr-optional">`widget.init`</span> Initializes the widget (its DOM). Called before the first search. Takes an object with the following keys:
    - state: the [search state](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html).
    - helper: the [helper](https://community.algolia.com/algoliasearch-helper-js/docs/AlgoliaSearchHelper.html) used to create a new search query
    - templatesConfig: the template configuration
  - <span class="attr-optional">`widget.render`</span>: Renders the widget after the search results come back from algolia. Takes an object with the following keys:
    - results: the [results](https://community.algolia.com/algoliasearch-helper-js/docs/SearchResults.html) of the query
    - state: the [search state](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html).
    - helper: the [helper](https://community.algolia.com/algoliasearch-helper-js/docs/AlgoliaSearchHelper.html) used to create a new search query
    - createURL: function provided to create urls

  </div>
</div>
</div>

**instantsearch.js** was designed with extensibility in mind. You can build your own widget by creating an object that exposes some of those methods:

 * `getConfiguration()`: configures the underlying [AlgoliaSearch JS Helper](https://community.algolia.com/algoliasearch-helper-js/docs/)
 * `init()`: called once after the initialization
 * `render()`: called every time we have new search data

You must at least define `init` or `render` methods.

#### jQuery widget
{:.no-toc}

You can use [jQuery](https://jquery.com/) to power your custom widgets.

To get started, check out our simple boilerplate [<i class='fa fa-github'></i> instantsearch/instantsearch-jQuery-widget](https://github.com/instantsearch/instantsearch-jQuery-widget).

To wrap an existing jQuery plugin, see our [<i class="fa fa-github"></i> instantsearch/instantsearch-ion.rangeSlider](https://github.com/instantsearch/instantsearch-ion.rangeSlider) widget.

#### plain JavaScript widget
{:.no-toc}

You can extend the capabilities of instantsearch.js using plain JavaScript, no need to include any extra dependency.

Have a look at our simple JavaScript example [<i class='fa fa-github'></i> instantsearch/instantsearch-JavaScript-widget](https://github.com/instantsearch/instantsearch-JavaScript-widget) to get started.

#### React widget
{:.no-toc}

A third option for your widgets is [React](http://facebook.github.io/react/). instantsearch.js is already based on React.

We have a simple commonJS boilerplate: [<i class='fa fa-github'></i> instantsearch/instantsearch-React-widget ](https://github.com/instantsearch/instantsearch-React-widget).

Or you can wrap an existing React component, see our [<i class='fa fa-github'></i> instantsearch/instantsearch-googlemaps](https://github.com/instantsearch/instantsearch-googlemaps) widget.

### Custom themes

All widgets have been designed to be heavily stylable with CSS rules. **instantsearch.js** ships with a default CSS theme that only includes the necessary CSS classes.

You can see all the existing customizable CSS classes in the [non minified CSS](https://cdn.jsdelivr.net/instantsearch.js/1/instantsearch.css).

We use [Sass](http://sass-lang.com/) to build the CSS.

We're also following [BEM](http://getbem.com/introduction/), a methodology that helps you achieve reusable components and code sharing in the front-end.

If you want to build you own theme, we recommend you to start from our default stylesheet: [instantsearch.scss](https://github.com/algolia/instantsearch.js/blob/master/src/css/instantsearch.scss).

#### BEM modifiers
{:.no-toc}

<div class="codebox-combo">

We're providing a few SCSS mixins to help you write BEM rules. Those mixins can be loaded from the `_base.scss` file.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight scss %}
// .ais-<block>--<element>
@include bem(block, element) {
  color: red
}

// .ais-<block>--<element>__<modifier>
@include bem(block, element, modifier) {
  color: red
}

// .ais-<block>
@include block(block) {
  // .ais-<block>--<element>
  @include element(element) {
    // .ais-<block>--<element>__<modifier>
    @include modifier(modifier) {
      color: red
    }
  }
}
{% endhighlight %}
  </div>
</div>

</div>

<div class="clearfix"></div>

#### Example
{:.no-toc}

<div class="codebox-combo">

If you want to style the **search-box** widget, you can do:

<div class="code-box">
<div class="code-sample-snippet js-toggle-snippet ignore">
<div class="row">
<div class="col-sm-6">
<strong class="text-white">With SCSS</strong>
{% highlight scss %}
@import 'base'

@include bem(search-box, input) {
  border: 1px solid #A9A9A9;
  height: 40px;
  padding: 0 8px;
  width: 100%;
  color: #636363;
}
{% endhighlight %}
</div>
<div class="col-sm-6">
<strong class="text-white">With CSS</strong>
{% highlight css %}
.ais-search-box--input {
  border: 1px solid #A9A9A9;
  height: 40px;
  padding: 0 8px;
  width: 100%;
  color: #636363;
}
{% endhighlight %}
  </div>
</div>
</div>
</div>
</div>
