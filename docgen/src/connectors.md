---
title: Introduction
mainTitle: Connectors
layout: main.pug
category: connectors
withHeadings: true
navWeight: 100
editable: true
githubSource: docgen/src/connectors.md
---

## Introduction to connectors

Connectors are the render-less counterparts of the widgets. They encapsulate
all the logic needed for making search widgets. Each one of them is specialized
to make a certain type of widget.

If you want to create a type of widget that is not available, you should then
create a [custom widget](guides/custom-widget.html).

## Anatomy of a connector

A connector is a function that will create a widget factory, a function that can
create widget instances.

They follow the pattern:

```javascript
(rendering) => (widgetParameters) => Widget
```

In practice, creating a new custom widget based on a connector would look like that:

```javascript
const makeHits = instantsearch.connectors.connectHits(function renderHits({hits}) {
  hits.forEach(function(hit) {
    console.log(hit);
  });
});

const search = instantsearch(/* options */);
search.addWidget(makeHits());
```

## Reusability of connectors

Connectors are meant to be reusable, it is important to be able to pass options to
the rendering of each single widget instance when instantiating them. That's why
all the options passed to the newly created widget factory will be forwarded to the
rendering.

Let's take an example where we want to be able to configure the DOM element that will
host the widget:

```javascript
const makeHits = connectHits(function renderHits({hits, widgetParams}) {
  // widgetParams contains all the option used to call the widget factory
  const container = widgetParams.container;  
  container.html(hits.map(hit => JSON.stringify(hit)));
});

const search = instantsearch(/* options */);
search.addWidget(makeHits({container: $('#hits-1')}));
search.addWidget(makeHits({container: $('#hits-2')}));
```

## When is the rendering function called?

The rendering function is called before the first search (*init* lifecycle step)
and each time results come back from Algolia (*render* lifecycle step).

Depending on the method you are relying on to render your widget, you might
want to use the first call to create the basic DOM structure (like when using
vanilla JS or jQuery).

To be able to identify at which point of the lifecycle the rendering function is
called, a second argument `isFirstRendering` is provided to the rendering function.

This parameter is there to be able to only do some operations once, like creating
the basic structure of the new widget once. The latter calls can then be used to
only update the DOM.

```javascript
const makeHits = instantsearch.connectors.connectHits(function renderHits({hits}, isFirstRendering) {
  if(isFirstRendering) {
    // Do some initial rendering
  }

  // Do the normal rendering
});

const search = instantsearch(/* options */);
search.addWidget(makeHits());
```
