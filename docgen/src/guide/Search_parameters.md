---
title: Search parameters
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 57
---

Algolia has a [wide range of parameters](https://www.algolia.com/doc/api-client/javascript/search#search-parameters). If one of the parameters you want to use is not covered by any widget or connector, then you can use the `<Configure>` widget.

Here's an example configuring the [distinct parameter](https://www.algolia.com/doc/api-client/javascript/parameters#distinct):

```jsx
<InstantSearch
  appId="appId"
  apiKey="apiKey"
  indexName="indexName"
>
  <Configure distinct={1}/>
  // widgets
</InstantSearch>
```

**Notes:**
* There's a dedicated guide showing how to [configure default refinements](guide/Default_refinements.html) on widgets.
* You could also pass `hitsPerPage: 20` to configure the number of hits being shown when not using
the [`<HitsPerPage>` widget](widgets/HitsPerPage.html).

## Changing dynamically search parameters

Every applied search parameters can be retrieved by listening to the `onSearchStateChange` 
hook from the [`<InstantSearch>`](guide/<InstantSearch>.html) root component.

To update the search parameters, you need to pass new props to the `<Configure/>` widget. 

[Read the example](https://github.com/algolia/instantsearch.js/tree/v2/packages/react-instantsearch/examples/geo-search) performing geo-search with `react-instantsearch` to see how you can update search parameters.

**Notes:**
* Modifying configure parameters through the search state will have no effect.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Routing.html">← Routing</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Search_state.html">Search state →</a>
    </div>
</div>
