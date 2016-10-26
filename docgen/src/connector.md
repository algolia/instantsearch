---
title: Connectors
layout: main-entry.pug
category: HOC
tocVisibility: false
---

Connectors are higher order components. They encapsulate the logic for
a specific kind of widget and they provide a way to interact with
the instantsearch context.

As higher order components, they have an outer component API that we call
**exposed props** and they will provide some other props to the wrapped
components which are called the **provided props**.

Connectors are exposed so that you can create your own widgets very easily.
