---
title: Components
layout: main-entry.pug
category: component
tocVisibility: true
navWeight: 1000
---

## Components Introduction

react-instantsearch provides a root component and widgets. The root component
will provide a context to its children to let them interact with Algolia. Widgets
are components that have the ability to interact with the context.

## Widgets

The widgets are plain components that are connected to the instantsearch context.
To make this connection, they are wrapped using our collection of Higher Order
Components that we call connectors. They are available under 
the namespace `dom`.

Here's an example for the SearchBox:

```js
import {SearchBox} from 'react-instantsearch/dom'
```


