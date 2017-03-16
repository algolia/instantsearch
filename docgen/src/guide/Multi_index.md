---
title: Multi index
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 50
---

Whenever you want to:

* display hits from different indices
* share a single SearchBox
* synchronize widgets between different indices

You can use multiple [`<Index>`](widgets/<Index>.html) instances.

The `<Index>` component takes one props, the targetted index name. 

When using a `<Index>` component under an `<InstantSearch>` root component you can declare widgets that will target a precise index. 

Widgets that targets all the indices, like the SearchBox, should remain under the `<InstantSearch>` root component. 

[Read the example](https://github.com/algolia/instantsearch.js/tree/v2/packages/react-instantsearch/examples/multi-index) displaying hits from two different indices.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_parameters.html">← Search Parameters</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Custom_connectors.html">Custom connectors →</a>
    </div>
</div>
