---
title: Search parameters
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 57
---

Algolia has a [wide range of parameters](https://www.algolia.com/doc/api-client/javascript/search#search-parameters). If one of the parameter you want to use is not covered by any widget or connector, then you can directly pass it to the `<InstantSearch>` component.

Here's an example configuring the [distinct parameter](https://www.algolia.com/doc/api-client/javascript/parameters#distinct):

```jsx
<InstantSearch
  appId="appId"
  apiKey="apiKey"
  indexName="indexName"
  searchParameters={{distinct: 1}}
>
  // widgets
</InstantSearch>
```

**Notes:**
* There's a dedicated guide showing how to [configure default refinements](guide/Default_refinements.html) on widgets.
* You could also pass `hitsPerPage: 20` to configure the number of hits being shown when not using
the [`<HitsPerPage>` widget](widgets/HitsPerPage.html).

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Routing.html">← Routing</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Search%20state.html">Search state →</a>
    </div>
</div>