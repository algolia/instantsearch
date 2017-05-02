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
