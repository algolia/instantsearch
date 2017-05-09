---
title: Migrate to V2
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 0
---

## No more `hitsPerPage` in `hits` and `infiniteHits`

This option has been removed from those two widgets. To configure
this option of the engine, there are still three ways:

 - use the [dashboard](https://www.algolia.com/explorer/display/) or
   the [client](https://www.algolia.com/doc/api-client/default/settings/#set-settings),
   to change the setting at the index level.
 - use the [hitsPerPageSelector](../widgets/hitsPerPageSelector.html) widget.
 - use the configuration option of instantsearch:

```javascript
var search = instantsearch({
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
search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    attributeName: 'brand',
    sortBy: ['count:desc', 'name:asc'],
  })
);

search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    attributeName: 'categories',
    sortBy: ['count:desc', 'name:asc']
  })
);
```

If you want to learn more about sorting the values, check out the widget API to see what are
the valid values for the `sortBy` option of [menu](../widgets/menu.html#struct-MenuWidgetOptions-sortBy) or
[refinementList](../widgets/refinementList.html#struct-RefinementListWidgetOptions-sortBy)

## Templates not working

Internally all the widgets are now using the connectors. And we wanted their API
to be close to the one offered by react-instantsearch connectors. This then
impacted the name of some variables in the templates.

List of global changes:

 - name ==> label (hierarchicalMenu, item template, the value to display)
 - name ==> value (refinementList, item template, the value to refine)


