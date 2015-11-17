---
layout: documentation
title: Documentation
permalink: /documentation/
noFooter: true
---

{::options parse_block_html="true" /}

## Introduction

<div class="shameless-marketing text-center hidden-xs">
<img src="../img/logo-instantsearch.svg" height="40" alt="logo instantsearch.js"/>
<div class="lead">
  <p>Build the perfect UI with instantsearch.js,<br> a library of widgets designed to help you create a high performance instant search experience.</p>
  <p class="version">Version: <strong>{{ site.version }}</strong></p>
</div>
<div class="spacer40"></div>
<div class="row">
<div class="col-md-4 m-b">
<div class="sticker sticker-algolia">
<img src="{{site.baseurl}}/img/logo-algolia-notext.svg" width="26"/>
</div>
Built on top of the <a href="https://www.algolia.com">Algolia Search API</a>
</div>
<div class="col-md-4 m-b">
<div class="sticker sticker-open-source">
<img src="{{site.baseurl}}/img/logo-open-source.svg" width="30"/>
</div>
Community driven and available on <a href="http://github.com/algolia/instantsearch.js">Github</a>
</div>
<div class="col-md-4 m-b">
<div class="sticker sticker-ux">
<img src="{{site.baseurl}}/img/logo-UX.svg" width="30"/>
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

The library is open-source, based on [React.js](http://facebook.github.io/react/) and hosted on GitHub: [<i class="fa fa-github"></i> algolia/instantsearch.js](https://github.com/algolia/instantsearch.js). All contributions are welcome.

### Setup

#### From a CDN
{:.no-toc}

<div class="codebox-combo">

The fastest way to get started is to use a built version of **instantsearch.js** from a CDN:

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight html %}
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.css">
<script src="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.js"></script>
{% endhighlight %}
  </div>
</div>

</div>

This will expose the global `instantsearch` function.

#### From NPM
{:.no-toc}

<div class="codebox-combo">

If you already have a JavaScript build system, you can use **instantsearch.js** from NPM:

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
// TODO: include the instantsearch.js/dist/instantsearch.css file as well
{% endhighlight %}
  </div>
</div>

</div>

### Initialization

<div class="codebox-combo">

To initialize the **instantsearch.js** library, you need an Algolia account with a configured and non-empty index. You can find your Algolia credentials on the [credentials page of your dashboard](https://www.algolia.com/licensing). Use the **APPLICATION\_ID** `appId`, the **search only API\_KEY** `apiKey` and an index name `indexName` to configure the required parameters of the `instantsearch` function.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet config">
{% highlight javascript %}
var search = instantsearch({
  appId: '$appId',
  apiKey: '$apiKey',
  indexName: '$indexName'
});
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style="display: none">
{% highlight javascript %}
instantsearch(options);
{% endhighlight %}

{% include widget-jsdoc/instantsearch.md %}
  </div>
  <div class="requirements js-toggle-requirements">
Make sure you are using the **search-only API key** and that you have created
the index.
  </div>
</div>

</div>

If you don't have any indices yet, learn how to push your data with the [Algolia getting started guide](https://www.algolia.com/getstarted).

We also expose a few options that can be used to configure the default and initial behavior of the instantsearch instance.

### Adding Widgets

<div class="codebox-combo">

To build your search results page, you need to combine several widgets. Start by adding a `searchBox` widget, a `hits` widget and a `pagination` widget to build a basic results page.

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight html %}
<div id="search-box"></div>

<script>
  // [...]
  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
      placeholder: 'Search for products...'
    })
  );
</script>
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style="display: none">
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
    <link rel="stylesheet" href="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.css" />
  </head>
  <body>
    <input type="text" id="search-box" />
    <div id="hits-container"></div>
    <div id="pagination-container"></div>

    <script src="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.js"></script>
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

<img class="img-responsive" src="../img/add-widgets.jpg" alt="Add widgets">

## Widgets

### Fundamental widgets

#### searchBox

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-searchbox.svg">
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
    poweredBy: true,
    cssClasses: {
      root: '',
      input: '',
      poweredBy: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style="display: none">
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

<img class="widget-icon pull-left" src="../img/icon-widget-results.svg">
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
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
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

<img class="widget-icon pull-left" src="../img/icon-widget-hitperpage.svg">
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
    ],
    cssClasses: {
      root: '',
      item: ''
    }
  })
);
{% endraw %}
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
{% raw %}
instantsearch.widgets.hitsPerPageSelector(options);
{% endraw %}
{% endhighlight %}

{% include widget-jsdoc/hitsPerPageSelector.md %}

  </div>
  <div class="requirements js-toggle-requirements">
The [hits](#hits) widget lets you define the default number of results
displayed. This value must also be defined in the `options` parameter.
  </div>
</div>

</div>

<div id="hits-per-page-selector" class="widget-container"></div>

### Navigation

#### pagination

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-pagination.svg">
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
    scrollTo: false, // 'body' by default
    cssClasses: {
      root: '',
      item: '',
      link: '',
      page: '',
      previous: '',
      next: '',
      first: '',
      last: '',
      active: '',
      disabled: ''
    }
  })
);
    {% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
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

<img class="widget-icon pull-left" src="../img/icon-widget-menu.svg">
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
    },
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      list: '',
      item: '',
      active: '',
      link: '',
      checkbox: '',
      count: ''
    }
  })
);
{% endhighlight %}
  </div>

  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.menu(options);
{% endhighlight %}

{% include widget-jsdoc/menu.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must also be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div  id="categories" class="widget-container"></div>

#### hierarchicalMenu

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-hierarchical.svg">
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
    },
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      list: '',
      item: '',
      active: '',
      label: '',
      checkbox: '',
      count: ''
    }
  })
);
{% endhighlight %}
  </div>

  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.hierarchicalMenu(options);
{% endhighlight %}

{% include widget-jsdoc/hierarchicalMenu.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute used for faceting must be an object that follows a [specific
convention](https://github.com/algolia/algoliasearch-helper-js#hierarchical-facets). For
example, to build this example menu, we have data that looks like:
{% highlight javascript %}
{
  "objectID": 4815162342,
  "hierarchicalCategories": {
    "lvl0": "Appliances"
    "lvl1": "Appliances > Air Conditioners"
    "lvl2": "Appliances > Air Conditioners > Portable Air Conditioners"
  }
{% endhighlight %}

The root attribute (here, `hierarchicalCategories`) must also be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.

  </div>
</div>
</div>

<div  id="hierarchical-categories" class="widget-container"></div>

### Filters

#### refinementList

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-refinement.svg">
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
    },
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      list: '',
      item: '',
      active: '',
      label: '',
      checkbox: '',
      count: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.refinementList(options);
{% endhighlight %}

{% include widget-jsdoc/refinementList.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must also be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div  id="brands" class="widget-container"></div>

#### numericRefinementList

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-numerical.svg">
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
        {end: 4, name: 'less than 4'},
        {start: 4, end: 4, name: '4'},
        {start: 5, end: 10, name: 'between 5 and 10'},
        {start: 10, name: 'more than 10'}
        ],
        templates: {
          header: 'Price'
        },
        cssClasses: {
          root: '',
          header: '',
          body: '',
          footer: '',
          list: '',
          link: '',
          active: ''
        }
      })
    );
    {% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
    {% highlight javascript %}
    instantsearch.widgets.numericRefinementList(options);
    {% endhighlight %}

    {% include widget-jsdoc/numericRefinementList.md %}
  </div>
</div>


</div>

<div  id="popularity" class="widget-container"></div>

#### toggle

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-toggle.svg">
This widget provides an on/off filtering feature based on an attribute value.
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
    },
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      list: '',
      item: '',
      active: '',
      label: '',
      checkbox: '',
      count: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.toggle(options);
{% endhighlight %}
{% include widget-jsdoc/toggle.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must also be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div  id="free-shipping" class="widget-container"></div>

#### rangeSlider

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-slider.svg">
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
      format: function(formattedValue) {
        return '$' + formattedValue;
      }
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.rangeSlider(options);
{% endhighlight %}
{% include widget-jsdoc/rangeSlider.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must also be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div id="price" class="widget-container"></div>

#### priceRanges

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-pricerange.svg">
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
    },
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      list: '',
      item: '',
      active: '',
      link: '',
      currency: '',
      separator: '',
      button: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.priceRanges(options);
{% endhighlight %}

{% include widget-jsdoc/priceRanges.md %}
  </div>
  <div class="requirements js-toggle-requirements">
The attribute defined in `attributeName` must also be defined as an
[attributesForFaceting](https://www.algolia.com/doc/rest#param-attributesForFaceting) in your index configuration.
  </div>
</div>

</div>

<div id="price-ranges" class="widget-container"></div>

#### numericSelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-index.svg">
This filtering widget lets the user choose between numerical refinements from a dropdown menu.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.numericSelector({
    container: '#popularity-selector',
    attributeName: 'popularity',
    operator: '>=',
    options: [
      { label: 'Top 10', value: 9900 },
      { label: 'Top 100', value: 9800 },
      { label: 'Top 500', value: 9700 }
    ],
    cssClasses: {
      root: '',
      item: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.numericSelector(options);
{% endhighlight %}

{% include widget-jsdoc/numericSelector.md %}
  </div>
</div>

</div>

<div id="popularity-selector" class="widget-container"></div>

#### starRating

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-star-rating.svg">
This filtering widget lets the user refine search results by the number of stars associated with an item. The underlying rating attribute needs to have from 0 to `max` stars.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.starRating({
    container: '#stars',
    attributeName: 'price',
    max: 5,
    labels: {
      andUp: '& Up'
    },
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      list: '',
      item: '',
      active: '',
      link: '',
      disabledLink: '',
      star: '',
      emptyStar: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.starRating(options);
{% endhighlight %}

{% include widget-jsdoc/starRating.md %}
  </div>
</div>

</div>

<div id="stars" class="widget-container"></div>

#### clearAll

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-clearall.svg">
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
    cssClasses: {
      root: '',
      header: '',
      body: '',
      footer: '',
      link: '',
    },
    autoHideContainer: false
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.clearAll(options);
{% endhighlight %}

{% include widget-jsdoc/clearAll.md %}
  </div>
</div>

</div>

<div id="clear-all" class="widget-container"></div>

### Sort

#### sortBySelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-index.svg">
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
    ],
    cssClasses: {
      root: '',
      item: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.sortBySelector(options);
{% endhighlight %}
{% include widget-jsdoc/sortBySelector.md %}
  </div>
  <div class="requirements js-toggle-requirements">
You need to create slave indices for every sort order you need, and
configure their `ranking` to use a custom attribute as the first criterion.
You can find more information [in our FAQ
page](https://www.algolia.com/doc/faq/index-configuration/how-to-sort-the-results-with-a-specific-attribute).
  </div>
</div>

</div>

<div id="sort-by-container" class="widget-container"></div>

### Information display

#### stats

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-stats.svg">
This widget lets you display how many results matched the query and how fast the search was.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats-container',
    cssClasses: {
      header: '',
      body: '',
      footer: '',
      time: ''
    }
  })
);
{% endhighlight %}
  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.stats(options);
{% endhighlight %}

{% include widget-jsdoc/stats.md %}
  </div>
</div>

</div>

<div id="stats-container" class="widget-container"></div>

## Templates

<div class="codebox-combo">
<div class="code-box">
  <div class="code-sample-snippet">
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
        return '<div>You have ' + data.nbHits + 'results, fetched in ' +
          data.processingTimMS +'ms.</div>'
      }
    }
  })
);
{% endhighlight %}
  </div>
</div>

  Most of the widgets accept a template or templates option that let you change the default rendering. Templates can be defined either as a [Mustache](https://mustache.github.io/) string or as a function receiving the widget data.

  See the documentation of each widget to see which data is passed to the template.
</div>

### Helpers

<div class="code-box">
  <div class="code-sample-snippet ignore">
  <!-- <strong class="text-white">Here is the syntax of a helper</strong> -->
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
      // [...]
    }
  }
});
{% endhighlight %}
  </div>
</div>

You can configure the options passed to underlying `Hogan.compile` by using `search.templatesConfig.compileOptions`. We accept all [compile options](https://github.com/twitter/hogan.js/#compilation-options).

Theses options will be passed to the `Hogan.compile` calls when you pass a custom template.


## Customize

### Custom Widgets

<div class="codebox-combo">

<div class="code-box">
  <div class="code-sample-snippet js-toggle-snippet ignore">
{% highlight javascript %}
var mySingletonWidget = {
  getConfiguration: function(searchParams) {
    return {
    };
  },

  init: function(options) {
  },

  render: function(options) {
  }
};

search.addWidget(mySingletonWidget);
{% endhighlight %}

  </div>
  <div class="jsdoc js-toggle-jsdoc" style='display:none'>

{% highlight javascript %}
search.addWidget(widget)
{% endhighlight %}

The widget may implement some of the following methods (depending on the need of the widget):

  - <span class="attr-optional">`widget.getConfiguration`</span>: Configures the underlying AlgoliaSearch JS helper. Takes a [SearchParameter](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html) and should return the properties needed as an object.
  - <span class="attr-optional">`widget.init`</span> Initializes the widget (its DOM). Called before the first search. Takes an object with the following keys:
    - state: the [search state](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html).
    - helper: the [helper](https://community.algolia.com/algoliasearch-helper-js/docs/AlgoliaSearchHelper.html) user to create new search query
    - templatesConfig: the template configuration
  - <span class="attr-optional">`widget.render`</span>: Renders the widget after the search results come back from algolia. Takes an object with the following keys:
    - results: the [results](https://community.algolia.com/algoliasearch-helper-js/docs/SearchResults.html) of the query
    - state: the [search state](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html).
    - helper: the [helper](https://community.algolia.com/algoliasearch-helper-js/docs/AlgoliaSearchHelper.html) user to create new search query
    - createURL: function provided to create urls

  </div>
</div>

**instantsearch.js** was designed with extensibility in mind. You can build your own widget by creating an object that exposes some of those methods:


 * `getConfiguration()`: configures the underlying [AlgoliaSearch JS Helper](https://community.algolia.com/algoliasearch-helper-js/docs/)
 * `init()`: called once after the initialization
 * `render()`: called every time we have new search data

</div>

#### Example with vanillaJS
{:.no-toc}

To extend the capabilities of instantsearch.js, you don't need to use any dependencies, you can use plain javascript. Have a look at our simple js example [<i class='fa fa-github'></i> instantsearch/instantsearch-JavaScript-widget](https://github.com/instantsearch/instantsearch-JavaScript-widget) to get started.

#### Example with jQuery
{:.no-toc}

You may also want to use jQuery to power your custom widgets and that's definitely possible. To get you started, you can check the simple example we made [<i class='fa fa-github'></i> instantsearch/instantsearch-jQuery-widget](https://github.com/instantsearch/instantsearch-jQuery-widget). We also made an other example integrating ion.rangeSlider jQuery plugin : [<i class="fa fa-github"></i> instantsearch/instantsearch-ion.rangeSlider](https://github.com/instantsearch/instantsearch-ion.rangeSlider).

#### Example with React
{:.no-toc}

You can also use React for your next widget. Have a look at a simple example, [<i class='fa fa-github'></i> instantsearch/instantsearch-React-widget ](https://github.com/instantsearch/instantsearch-React-widget), or dig into a full fledged React component integration, [<i class='fa fa-github'></i> instantsearch/instantsearch-googlemaps](https://github.com/instantsearch/instantsearch-googlemaps).

### Custom Themes

All widgets have been designed to be heavily stylizable with CSS rules. **instantsearch.js** ships with a default CSS theme, but its source code utilizes [Sass](http://sass-lang.com/), a popular CSS preprocessor.

We're using [BEM](http://getbem.com/introduction/), a methodology that helps you to achieve reusable components and code sharing in the front-end.

If you want to build you own theme, we recommend you start from our default stylesheet: [instantsearch.css](https://github.com/algolia/instantsearch.js/blob/master/css/instantsearch.scss).

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
