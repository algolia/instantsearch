---
title: Create new widgets
mainTitle: Guides
layout: main.pug
name: customize
category: guides
withHeadings: true
navWeight: 20
editable: true
githubSource: docgen/src/guides/custom-widget.md
---

## Creating new widgets

InstantSearch.js comes with [many widgets](widgets.html), by default. If those
widgets are not enough, they can be customized using the [connectors](connectors.html).

You might find yourself in a situation where both widgets and connectors are not sufficient,
that's why it is possible to create your own widget. Making widgets is the most advanced
way of customizing your search experience and it requires a deeper knowledge of InstantSearch.js
and Algolia. If you think that your needs are common, don't hesitate
to [open an issue](https://github.com/algolia/instantsearch.js/issues) or come
discuss it on the [forum](https://discourse.algolia.com/).

To be able to start making your own widgets, there are some elements that you need
to know:

 - the widget lifecycle
 - how to interact with the search state

There's a simple example of a custom widget at the end of this guide.

## The widget lifecycle and API

InstantSearch.js defines the widget lifecycle of the widgets in 4 steps:

 - the configuration step, during which the initial search configuration is computed
 - the init step, which happens before the first search
 - the render step, which happens after each result from Algolia
 - the dispose step, which happens when you remove the widget or dispose the InstantSearch instance

Thoses steps translate directly into the widget API. Widgets are defined as plain
JS objects with 4 methods:

 - `getConfiguration` (optional), returns the necessary subpart of the configuration, specific
    to this widget
 - `init`, optional, used to setup the widget (good place to first setup the initial DOM).
    Called before the first search.
 - `render`, optional, used to update the widget with the new information from the results.
    Called after each time results come back from Algolia
 - `dispose` optional, used to remove the specific configuration which was specified in the `getConfiguration` method.
    Called when removing the widget or when InstantSearch disposes itself.

If we translate this to code, this looks like:

```javascript
const search = instantsearch();
search.addWidget({
  getConfiguration: function() {
    // must return an helper configuration object, like the searchParameters
    // on the instantsearch constructor
  },
  init: function(initOptions) {
    // initOptions contains three keys:
    //   - helper: to modify the search state and propagate the user interaction
    //   - state: which is the state of the search at this point
    //   - templatesConfig: the configuration of the templates
  },
  render: function(renderOptions) {
    // renderOptions contains four keys:
    //   - results: the results from the last request
    //   - helper: to modify the search state and propagate the user interaction
    //   - state: the state at this point
    //   - createURL: if the url sync is active, will make it possible to create new URLs
  },
  dispose: function(disposeOptions) {
    // disposeOptions contains one key:
    //   - state: the state at this point to
    //
    // The dispose method should return the next state of the search,
    // if it has been modified.
  }
});
```

A widget is valid as long as it implements at least `render` or `init`.

## Interacting with the Search State

The previous custom widget API boilerplate is the reading part of the widgets. To be able to transform
user interaction into search parameters we need to be able to modify the state.

The whole search state is held by an instance of the
[JS Helper](https://community.algolia.com/algoliasearch-helper-js/) in InstantSearch.js.
This instance of the helper is accessible at the `init` and `render` phases.

The helper is used to change the parameters of the search. It provides methods
to change each parts of it. After changing the parameters, you should use the
[`search`](https://community.algolia.com/algoliasearch-helper-js/reference.html#AlgoliaSearchHelper#search)
method to trigger a new search. This search is then handled by Algolia
and when the results come back, InstantSearch will dispatch the new results to
all the widgets.

Mastering the creation of new widgets is closely linked to using the JS Helper,
that's why we recommend you read about its [concepts](https://community.algolia.com/algoliasearch-helper-js/concepts.html)
and have a look at the [getting started](https://community.algolia.com/algoliasearch-helper-js/gettingstarted.html).
You can also read more about the features offered by this library in the
[reference API](https://community.algolia.com/algoliasearch-helper-js/reference.html).

## Full custom widget example

To give you an idea of the power of this API, let's have a look at a minimal
implementation of a search UI with a searchbox and hits.

In this example, the widgets are not reusable and will assume that
the DOM is already set up. You can [see the example live](https://jsfiddle.net/bobylito/v453u1kv/) on jsFiddle.

```javascript
const search = instantsearch({
  indexName: 'movies',
  searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
});

search.addWidget({
  init: function(opts) {
    const helper = opts.helper;
    const input = document.querySelector('#searchBox');
    input.addEventListener('input', function(e) {
      helper.setQuery(e.currentTarget.value) // update the parameters
            .search(); // launch the query
    });
  }
});

search.addWidget({
  render: function(opts) {
    const results = opts.results;
    // read the hits from the results and transform them into HTML.
    document.querySelector('#hits').innerHTML = results.hits.map(function(h) {
      return '<p>' + h._highlightResult.title.value + '</p>';
    }).join('');
  }
});

search.start();
```
