---
title: Introduction
mainTitle: Widgets
layout: widget-showcase.pug
category: widgets
withHeadings: true
navWeight: 100
editable: true
githubSource: docgen/src/widgets.md
---

## Introduction to widgets

In InstantSearch.js, widgets are the building blocks of search UI.

In order to make your work efficient, InstantSearch.js it comes with a set
of 18 widgets factories, functions that create widget instances. Each one
of them is specialized by role: searchbox, pagination, numeric filters and so
on...

Widgets can be added to the InstantSearch instance using the `addWidget` method.

```javascript
const search = instantsearch(/* parameters here */);
search.addWidget(instantsearch.widgets.searchbox(/* searchbox parameters */));
```

In the next sections, we showcase the widgets InstantSearch.js provides. If you want to learn more about the API, have a look at the [common widgets API](widgets-common-api.html).

