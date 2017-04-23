---
title: Introduction
mainTitle: Connectors
layout: main.pug
category: connectors
withHeadings: true
navWeight: 100
---

## Introduction to connectors

Connectors are the render-less counterparts of the widgets. They encapsulate
all the logic needed for making search widgets. Each one of them is specialized
to make a certain type of widget.

If you want to create a type of widget that is not available, you should then
create a [custom widget]()

## Anatomy of a connector

A connector is a function that will create a widget factory, a function that can
create widget instances.

They follow the pattern:

```js
(rendering) => (widgetParameters) => Widget
```

In practice, creating a new custom widget based on a connector would look like that:

```js
const makeHits = connectHits(function renderHits({hits}, isFirstRendering) {
  hits.forEach(function(hit) {
    console.log(hit);
  });
});

const search = instantsearch(/* options */);
search.add(makeHits());
```

## When is the rendering function called?

The rendering function is called at the before the first search (*init* lifecycle step)
and each time results come back from Algolia (*render* lifecycle step).

To be able to identify at which point of the lifecycle the rendering function is
called, a second argument `isFirstRendering` is provided to the rendering function.

This parameter is there to be able to only do some operations once, like creating
the basic structure of the new widget once. The latter calls can then be used to
only update the DOM.

## Reusability of connectors

Connectors are meant to be reusable, it is important to be able to pass options to
the rendering of each single widget instance when instantiating them. That's why
all the options passed to the newly created widget factory will be forwarded to the
rendering.

Let's take an example where we want to be able to configure the DOM element that will
host the widget:

```js
const makeHits = connectHits(function renderHits({hits, widgetParams}) {
  // widgetParams contains all the option used to call the widget factory
  const container = widgetParams.container;  
  container.html(hits.map(hit => JSON.stringify(hit)));
});

const search = instantsearch(/* options */);
search.add(makeHits({container: $('#hits-1')}));
search.add(makeHits({container: $('#hits-2')}));
```
