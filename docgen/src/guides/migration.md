---
title: Migrate from v1
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 10
editable: true
githubSource: docgen/src/guides/migration.md
---

## The searchBox widget has new default options

To identify correctly the input as a search box we added a magnifier glass at the start of the input
and a reset button displayed as a cross on the end.

You can customize the result with these two options:
 - **reset** `boolean|{template?: string|Function, cssClasses?: {root: string}}`
   Display a reset button in the input when there is a query.
 - **magnifier** `boolean|{template?: string|Function, cssClasses?: {root: string}}`
   Display a magnifier should at beginning of the input.
   
To make the search box like in v1, you can do the following:

```javascript
const search = instantsearch(/* Your parameters here */);
search.addWidget(instantsearch.widgets.searchbox({
  container: '#your-search-input',
  reset: false,
  magnifier: false,
}));
```

You can read more about these options [here](widgets/searchBox.html).

## No more `hitsPerPage` in `hits` and `infiniteHits`

This option has been removed from those two widgets. To configure
this option of the engine, there are still three ways:

 - use the [dashboard](https://www.algolia.com/explorer/display/) or
   the [client](https://www.algolia.com/doc/api-client/default/settings/#set-settings),
   to change the setting at the index level.
 - use the [hitsPerPageSelector](widgets/hitsPerPageSelector.html) widget.
 - use the configuration option of `instantsearch`:

```javascript
const search = instantsearch({
  // ... do not forget the credentials
  searchParameters: {
    hitsPerPage: 42,
  }
});
```

## The items are not sorted like before in the refinementList / menu

We changed the default sort order of those widgets. This might have impacted your implementation
if you didn't specify them originally. To change back the order use the `sortBy` configuration
key.

Here are examples of usage of `sortBy` using the previous sorting scheme:

```javascript
const yourSearch = instantsearch(/* parameters */);
yourSearch.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    attributeName: 'brand',
    // now the default is ['isRefined', 'count:desc', 'name:asc']
    sortBy: ['count:desc', 'name:asc'],
  })
);

yourSearch.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    attributeName: 'categories',
    // now the default is ['name:asc']
    sortBy: ['count:desc', 'name:asc']
  })
);
```

If you want to learn more about sorting the values, check out the widget API to see what are
the valid values for the `sortBy` option of [menu](widgets/menu.html#struct-MenuWidgetOptions-sortBy) or
[refinementList](widgets/refinementList.html#struct-RefinementListWidgetOptions-sortBy)

## Some variables have been changed

Internally all the widgets are now using the connectors. And we wanted their API
to be close to the one offered by
[react-instantsearch connectors](https://community.algolia.com/react-instantsearch/connectors/).
This then impacted the name of some variables in the templates and the API.

Changes in templates:

 - In the item template of the hierarchicalMenu and menu widgets, `name` becomes `label`
 - In the item template of the refinementList widget, `name` becomes `value`.

Changes in the API:

 - In hitsPerPageSelector, the `options` has been renamed to `items`.

## React components can't be used as templates

When we created InstantSearch.js, it was built using React and we didn't
know that we would build react-instantsearch. However, we have now [react-instantsearch](https://community.algolia.com/react-instantsearch)
and it is the recommended solution if your application uses React. That's why we're
dropping in this version the support for the react based templates.

As of now, we consider the engine used to build the widgets in InstantSearch.js
as an implementation detail. Since we do not expose it anymore, we'll be able
to change it and use the best solution for each release.

## RangeSlider widget is using Rheostat as Slider Component

Slider compoments are hard to implement and that's why we rely on an external
component for that. We are taking the opportunity of this new version
to switch to the current state of the art of sliders: [Rheostat](https://github.com/airbnb/rheostat).

If you want to customize the style, some CSS classes have changed. You can find
examples of stylesheets by clicking [here](https://github.com/airbnb/rheostat/tree/master/css).

We are still providing a look which is similar as the one in the V1.

## searchFunction can be used to modify parameters

Introduced in 1.3.0, `searchFunction` was originally meant as a way to modify
the timing of the search. However we realized that it was a good way to
alter the search state before making the actual state.

This is what was required to force the query string:

```javascript
const search = instantsearch({
  /* other parameters */
  searchFunction: function(helper) {
    search.helper.setQuery('fixed query');
    helper.search();
  }
});
```

And now, it is more straightforward:

```javascript
const search = instantsearch({
  /* other parameters */
  searchFunction: function(helper) {
    helper.setQuery('fixed query').search();
  }
});
```

Bear in mind that the helper [still resets the page to 0](https://community.algolia.com/algoliasearch-helper-js/concepts.html#smart-page-behaviour)
when the parameters change. So in order to keep
the previously set page you have to do the following:

```javascript
const search = instantsearch({
  /* other parameters */
  searchFunction: function(helper) {
    const p = helper.getPage();
    helper.setQuery('fixed query')
          .setPage(p)
          .search();
  }
});
```
