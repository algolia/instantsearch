---
title: Sorting and filtering items
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 78
---

A frequent question that comes up is "How do I sort or filter the items of my widget".

For this, widgets and connectors that are handling items expose a `transformItems` prop. This prop is a function that has the `items` provided 
prop as a parameter. It will expect in return the `items` prop back.

This props can be found on every widgets or connectors that handle a list of `items`:
* [`<CurrentRefinements/>`](widgets/CurrentRefinements.html) and [`connectCurrentRefinements`](connectors/connectCurrentRefinements.html)
* [`<HierarchicalMenu/>`](widgets/HierarchicalMenu.html) and [`connectHierarchicalMenu`](connectors/connectHierarchicalMenu.html)
* [`<Menu/>`](widgets/Menu.html) and [`connectMenu`](connectors/connectMenu.html)
* [`<RefinementList/>`](widgets/RefinementList.html) and [`connectRefinementList`](connectors/connectRefinementList.html)
* [`<SortBy/>`](widgets/SortBy.html) and [`connectSortBy`](connectors/connectSortBy.html)
* [`<HitsPerPage/>`](widgets/HitsPerPage.html) and [`connectHitsPerPage`](connectors/connectHitsPerPage.html)
* [`<MultiRange/>`](widgets/MultiRange.html) and [`connectMultiRange`](connectors/connectMultiRange.html)

The following example will show you how to change the default sort order of the [`<RefinementList/>`](widgets/RefinementList.html) widget.

```jsx
import {InstantSearch, RefinementList} from 'react-instantsearch/dom';
import {orderBy} from 'lodash';

const App = () =>
  <InstantSearch
    appId="..."
    apiKey="..."
    indexName="..."
  >
    <SearchBox defaultRefinement="hi" />
    <RefinementList attributeName="category"
                    transformItems={items => orderBy(items, ['label', 'count'], ['asc', 'desc'])}/>
  </InstantSearch>;
```

**Notes:**
* The example shows how to sort items, but you can also filter them

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/i18n.html">← i18n</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Connectors.html">Connectors →</a>
    </div>
</div>