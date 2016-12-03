---
title: Algolia parameters
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
</InstantSearch>
```

**Notes:**
* There's a dedicated guide showing how to [configure default refinements](/guide/Default%20refinements.html) on widgets.

<div class="guide-nav">
Next: <a href="/guide/Search state.html">Search state →</a>
</div>
