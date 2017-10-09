---
title: Migration Guides
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 10
---

React InstantSearch is evolving over time. Here are the migration guides we provide if you need to upgrade:

## From v3 to v4

[Check out our v4 announcement post](https://discourse.algolia.com/t/react-instantsearch-v4/1329)

## From v2 to v3

* Anytime you are using a connector, when there are no more items in it or no more hits, we will still call your Component. Thus you will have to handle cases like dealing with empty arrays and decide if you want to unmount or hide the widget.

* Anytime you are using a widget, when there are no more items in it or no more hits, we will still display the widget. You can then decide to hide it with CSS.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Autocomplete_menu.html">← Autocomplete menu</a>
    </div>
</div>
