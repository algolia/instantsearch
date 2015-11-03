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
<p class="lead">Build the perfect UI with Instantsearch.js,<br>an extensive library of widgets for search experience.</p>
<p class="version">Version : {{ site.version }}</p>
<div class="spacer40"></div>
<div class="row">
<div class="col-md-4 m-b">
<div class="sticker sticker-algolia">
<img src="{{site.baseurl}}/img/logo-algolia-notext.svg" width="26"/>
</div>
Built on top of <a href="https://www.algolia.com">Algolia Search API</a>
</div>
<div class="col-md-4 m-b">
<div class="sticker sticker-open-source">
<img src="{{site.baseurl}}/img/logo-open-source.svg" width="30"/>
</div>
Driven by community and available on  <a href="http://github.com/algolia/instantsearch.js">Github</a>
</div>
<div class="col-md-4 m-b">
<div class="sticker sticker-ux">
<img src="{{site.baseurl}}/img/logo-UX.svg" width="30"/>
</div>
UI/UX Best practices
</div>
</div>
</div>

**instantsearch.js** is a JavaScript library that lets you create an instant search results page using Algolia's REST API.

Everything is about adding the meaningful widgets to compose the final search results page. Widgets are the UI components that will either deal with the input of the search (like the search bar or the facets/filters over attributes) or the output (like the actual results or some meta information about the search).

Each widget is independent and their rendering is bound to the search. They follow the **instantsearch.js** lifecycle:

  - **Configuration**: each widget add new query parameters to the underlying Algolia API client.
  - **Initial rendering**: before the initial search, the widget may update the UI.
  - **Rendering**: on each search, after the results come back from Algolia, the widgets update themselves.

The library is open-source, based on [React.js](http://facebook.github.io/react/) and hosted on GitHub: [<i class="fa fa-github"></i> algolia/instantsearch.js](https://github.com/algolia/instantsearch.js). All contributions are very welcome.

### Setup

#### From a CDN
{:.no-toc}

<div class="codebox-combo">

The fastest way to get started is to use a built version of **instantsearch.js** from a CDN:

<div class="code-box">
  <div class="code-sample-snippet ignore">
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
  <div class="code-sample-snippet ignore">
{% highlight sh %}
npm install instantsearch.js --save
{% endhighlight %}
  </div>
</div>
<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
var instantsearch = require('instantsearch.js');
// TODO: include the instantsearch.js/dist/instantsearch.css file as well
{% endhighlight %}
  </div>
</div>

</div>

### Initialization

<div class="codebox-combo">

To initialize the **instantsearch.js** library you need an Algolia account with a configured & non-empty index. You'll find your Algolia credentials on the [credentials page of your dashboard](https://www.algolia.com/licensing). Use the **APPLICATION\_ID** `appId`, the **search only API\_KEY** `apiKey` and an index name `indexName` to configure the required parameters of the `instantsearch` function.

<div class="code-box">
  <div class="code-sample-snippet config">
{% highlight javascript %}
var search = instantsearch({
  appId: '$appId',
  apiKey: '$apiKey',
  indexName: '$indexName'
});
{% endhighlight %}
  </div>
  <div class="jsdoc" style="display: none">
{% highlight javascript %}
instantsearch(options);
{% endhighlight %}

{% include widget-jsdoc/instantsearch.md %}
</div>
</div>


If you don't have any index yet, learn how to push your data with the [Algolia getting started](https://www.algolia.com/getstarted).

We also expose a few options that can be used to configure the default and initial behavior of the instantsearch instance.

### Adding Widgets

<div class="codebox-combo">

The build your search results page, you need to combine widgets together. Widgets are simple objects which hold the handler to part of the instant search lifecycle. Start by adding a `searchBox` widget, a `hits` widget and a `pagination` widget to build a fundamental results page.

<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight html %}
<div id="search-box"></div>

<script type="text/javascript">
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
  <div class="jsdoc" style="display: none">
{% highlight javascript %}
search.addWidget(widget)
{% endhighlight %}

{% include widget-jsdoc/addWidget.md %}

  </div>
</div>

</div>

Most widgets requires you to configure the DOM element they will use to display themselves.

**instantsearch.js** comes with [built-in widgets](#widgets) but you can also build your [own custom widgets](#custom-widgets).

### Start

<div class="codebox-combo">

Once all the widgets have been added to the instantsearch instance, just start the rendering calling the `start()` method.

<div class="code-box">
  <div class="code-sample-snippet start">
{% highlight javascript %}
search.start();
{% endhighlight %}
  </div>
</div>

</div>

<div class="spacer50"></div>

<div class="codebox-combo">

This example shows you how to create a very simple search results page with a search box, a list of hits and a pagination widget.

<div class="code-box">
  <div class="code-sample-snippet ignore">
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
The search box is the widget to use for text input. Underneath, it is based on the Algolia [query parameter](https://www.algolia.com/doc/rest#param-query). It will provide text search on the `attributesToIndex` setting set in your index.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style="display: none">
{% highlight javascript %}
instantsearch.widgets.searchBox(options)
{% endhighlight %}

{% include widget-jsdoc/searchBox.md %}

  </div>
</div>

</div>

<div id="q" class="widget-container"></div>

#### hits

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-results.svg">
The hits widget is the main component for displaying results from Algolia. It accepts a [Mustache]() template string or a function returning a string. See the [templates](#templates) section.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
{% raw %}
instantsearch.widgets.hits(options);
{% endraw %}
{% endhighlight %}

{% include widget-jsdoc/hits.md %}

  </div>
</div>

</div>

<div id="hits-container" class="widget-container"></div>


#### hitsPerPageSelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-results.svg">
The hitsPerPageSelector widget lets you select the number of results you want
displayed.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
      select: ''
    }
  })
);
{% endraw %}
{% endhighlight %}
  </div>
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
{% raw %}
instantsearch.widgets.hitsPerPageSelector(options);
{% endraw %}
{% endhighlight %}

{% include widget-jsdoc/hitsPerPageSelector.md %}

  </div>
</div>

</div>

<div id="hits-per-page-selector" class="widget-container"></div>

### Navigation

#### pagination

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-pagination.svg">
The pagination widget provides the ability to navigate through the result
pages.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
    {% highlight javascript %}
search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination-container',
    maxPages: 20,
    cssClass: ''
  })
);
    {% endhighlight %}
  </div>
  <div class="jsdoc" style='display:none'>
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
The menu widget provides a way to navigate based on the values of single faceted attributes.
Only one value can be selected at a time. It can be used for navigating in the categories
of an ecommerce website.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    facetName: 'categories',
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

  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.menu(options);
{% endhighlight %}

{% include widget-jsdoc/menu.md %}
  </div>
</div>

</div>

<div  id="categories" class="widget-container"></div>

#### hierarchicalMenu

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-menu.svg">
The hierarchical menu is a widget that lets the user explore a tree-like structure.
It is based on a set of faceted attributes that represent the different levels of depth. It is
commonly used in e-commerce websites for hierarchical categorization of products.
From a UX point of view, we suggest to not display more than two levels deep.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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

  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.hierarchicalMenu(options);
{% endhighlight %}

{% include widget-jsdoc/hierarchicalMenu.md %}
  </div>
</div>
</div>

<div  id="hierarchical-categories" class="widget-container"></div>

### Filters

#### refinementList

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-refinement.svg">
This filtering widget lets the user choose one or multiple values for a single faceted attribute. You can specify if you want to filters to be ORed or ANDed. For example, if you filter on `a` and `b` with `OR`, the
results that have either the value `a` or `b` will match.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    facetName: 'brand',
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.refinementList(options);
{% endhighlight %}

{% include widget-jsdoc/refinementList.md %}
  </div>
</div>

</div>

<div  id="brands" class="widget-container"></div>

#### numericRefinementList

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-refinement.svg">
This filtering widget lets the user choose one value for a single numeric attribute. You can specify if you want it to be a equality or a range by giving a "start" and an "end" value
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.numericRefinementList(options);
{% endhighlight %}

{% include widget-jsdoc/refinementList.md %}
  </div>
</div>

</div>

<div  id="popularity" class="widget-container"></div>

#### toggle

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-toggle.svg">
This filtering widget lets the user choose either or not to filter values to `true` for a single faceted boolean attribute.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free-shipping',
    facetName: 'free_shipping',
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.toggle(options);
{% endhighlight %}
{% include widget-jsdoc/toggle.md %}
  </div>
</div>

</div>

<div  id="free-shipping" class="widget-container"></div>

#### rangeSlider

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-slider.svg">
The range slider filters values of a single numeric attribute using 2 cursors: the lower and the upper bounds.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.rangeSlider(options);
{% endhighlight %}
{% include widget-jsdoc/rangeSlider.md %}
  </div>
</div>

</div>

<div id="price" class="widget-container"></div>

#### priceRanges

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-slider.svg">
This filtering widget lets the user choose between ranges of price. Those ranges are dynamically computed based on the returned results.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.priceRanges(options);
{% endhighlight %}

{% include widget-jsdoc/priceRanges.md %}
  </div>
</div>

</div>

<div id="price-ranges" class="widget-container"></div>

#### clearAll

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-clearall.svg">
This filtering widget lets the user choose between ranges of price. Those ranges are dynamically computed based on the returned results.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.clearAll(options);
{% endhighlight %}
{% include widget-jsdoc/clearAll.md %}
  </div>
</div>

</div>

<div id="clear-all" class="widget-container"></div>

### Sort

#### indexSelector

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-index.svg">
This widget lets you select which index you want to use for the search. Since Algolia uses slave indices to deal with the different sort orders of a single dataset, this widget is particularly useful to switch between those sort orders.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
{% highlight javascript %}
search.addWidget(
  instantsearch.widgets.indexSelector({
    container: '#index-selector-container',
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.indexSelector(options);
{% endhighlight %}
{% include widget-jsdoc/indexSelector.md %}
  </div>
</div>

</div>

<div id="index-selector-container" class="widget-container"></div>

### Information display

#### stats

<div class="codebox-combo">

<img class="widget-icon pull-left" src="../img/icon-widget-stats.svg">
This widget lets you display meta informations of the current search. It helps the user to understand how many results matched and how fast it was.
{:.description}

<div class="code-box">
  <div class="code-sample-snippet">
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
  <div class="jsdoc" style='display:none'>
{% highlight javascript %}
instantsearch.widgets.stats(options);
{% endhighlight %}

{% include widget-jsdoc/stats.md %}
  </div>
</div>

</div>

<div id="stats-container" class="widget-container"></div>

## Templates

Most of the widgets accept a template or templates option that let you change the default rendering. Templates can be defined either as a [Mustache](https://mustache.github.io/) string or as a function receiving the widget data.

See the documentation of each widget to see which data is passed to the template.

### Examples

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

### Helpers

In order to help you when defining your templates, **instantsearch.js** exposes a few helpers.

All helpers are accessible in the Mustache templating through `{% raw %}{{#helpers.nameOfTheHelper}}{{valueToFormat}}{{/helpers.nameOfTheHelper}}{% endraw %}`. To use them in the function templates, you'll have to call `search.templatesConfig.helpers.nameOfTheHelper` where `search` is your current **instantsearch.js** instance.

Here is the list of the currently available helpers:

- `formatNumber`: Will accept a number as input and returned the formatted
  version of the number in the locale defined with the `numberLocale` config
  option (defaults to `en-EN`).
  eg. `100000` will be formatted as `100 000` with `en-EN`

Here is the syntax of a helper:

{% highlight javascript %}
search.templatesConfig.helpers.emphasis = function(text, render) {
  return '<em>' + render(text) + '</em>';
};
{% endhighlight %}

In your helper, `this` always refers to the data:

{% highlight javascript %}
search.templatesConfig.helpers.discount = function(/*text, render*/) {
  var discount = this.price * 0.3;
  return '$ -' + discount;
};
{% endhighlight %}

### Options

You can configure the options passed to underlying `Hogan.compile` by using `search.templatesConfig.compileOptions`. We accept all [compile options](https://github.com/twitter/hogan.js/#compilation-options).

Theses options will be passed to the `Hogan.compile` calls when you pass a custom template.

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

## Customize

### Custom Widgets

**instantsearch.js** has been designed to be easily extended. You can easily create your own widget by instantiating an object that exposes some of those methods:

 * `getConfiguration()`: configures the underlying AlgoliaSearch JS Helper,
 * `init()`: called once after the initialization,
 * `render()`: called as soon as the underlying state has changed.

<div class="codebox-combo">

The widgets API is agnostic. In the built-in widgets, we use [VanillaJS](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
for simple widgets such as the searchBox and for the most advanced, we use
[ReactJS](https://facebook.github.io/react://facebook.github.io/react/).
If your code base is relying on an other framework, feel free to use it to create your own widget!

<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight javascript %}
var mySingletonWidget = {
  getConfiguration: function(searchParams) {
    return {
    };
  },

  init: function(state, helper, templatesConfig) {
  },

  render: function(options) {
  }
};

search.addWidget(mySingletonWidget);
{% endhighlight %}

</div>
<div class="jsdoc" style='display:none'>

{% highlight javascript %}
search.addWidget(widget)
{% endhighlight %}

The widget may implement some of the following methods (depending on the need of the widget):

  - <span class="attr-optional">`widget.getConfiguration`</span>: Configures the underlying AlgoliaSearch JS helper. Takes a [SearchParameter](http://algolia.github.io/algoliasearch-helper-js/docs/SearchParameters.html) and should return the properties needed as an object.
  - <span class="attr-optional">`widget.init`</span> Initializes the widget (its DOM). Called before the first search. Takes an object with the following keys:
    - state: the [search state](http://algolia.github.io/algoliasearch-helper-js/docs/SearchParameters.html).
    - helper: the [helper](http://algolia.github.io/algoliasearch-helper-js/docs/AlgoliaSearchHelper.html) user to create new search query
    - templatesConfig: the template configuration
  - <span class="attr-optional">`widget.render`</span>: Renders the widget after the search results come back from algolia. Takes an object with the following keys:
    - results: the [results](http://algolia.github.io/algoliasearch-helper-js/docs/SearchResults.html) of the query
    - state: the [search state](http://algolia.github.io/algoliasearch-helper-js/docs/SearchParameters.html).
    - helper: the [helper](http://algolia.github.io/algoliasearch-helper-js/docs/AlgoliaSearchHelper.html) user to create new search query
    - createURL: function provided to create urls

  </div>
</div></div>



#### Example with jQuery
{:.no-toc}

You may want to use an existing jQuery library to power your custom widget: that's definitely doable. Take a look at this jQuery-based custom widgets we've done: [<i class="fa fa-github"></i> algolia/instantsearch-ion.rangeSlider](https://github.com/algolia/instantsearch-ion.rangeSlider).

#### Example with React
{:.no-toc}

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti perspiciatis suscipit voluptas esse quam fugiat recusandae harum, illum, sint animi excepturi at. Aliquid accusamus ratione atque sit ipsam quia itaque.

### Custom Themes

All widgets have been designed to be heavily stylizable with CSS rules. **Instantsearch.js** ships with a vanilla CSS theme, but its source code utilizes [Sass](http://sass-lang.com/), a popular CSS preprocessor.

We're using [BEM](http://getbem.com/introduction/), a methodology that helps you to achieve reusable components and code sharing in the front-end.

If you want to build you own theme, we recommend you to start from our default skeleton: [instantsearch.css](https://github.com/algolia/instantsearch.js/blob/master/css/instantsearch.scss).

#### BEM modifiers
{:.no-toc}

<div class="codebox-combo">

We're providing a few SCSS mixins to help you write BEM rules. Those mixins can be loaded from the `_base.scss` file.

<div class="code-box">
  <div class="code-sample-snippet ignore">
{% highlight scss %}
// .ais-<component>--<element>
@include bem(component, element) {
  color: red
}

// .ais-<component>--<element>__<modifier>
@include bem(component, element, modifier) {
  color: red
}

// .ais-<component>
@include component(component) {
  // .ais-<component>--<element>
  @include element(element) {
    // .ais-<component>--<element>__<modifier>
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
<div class="code-sample-snippet ignore">
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
