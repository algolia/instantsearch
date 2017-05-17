---
title: Operations
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 52
---

[Algolia pricing](https://www.algolia.com/pricing) structure is based on operations and records.

This guide explains you how does using InstantSearch has an impact on your operations count.

Everytime you press a key in InstantSearch using the SearchBox, we count one operation.
Then given the widgets you will be adding to your search interface, you will have more operations
being counted at each keystroke.

For example, if you have a search made out of a SearchBox, a Menu and a RefinementList then every keystroke
will trigger two operations.

Then if a user refines one of the Menu or RefinementList, it will trigger a third operation at each keystroke.

A good rule to keep in mind is that most search interfaces using InstantSearch will trigger two operations
per keystroke. Then every refined widget (clicked widget) will add one more operation to the total count.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Search_state.html">← Search state</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Multi_index.html">Multi index →</a>
    </div>
</div>
