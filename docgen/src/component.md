---
title: Components
layout: main-entry.pug
category: component
tocVisibility: false
---


react-instantsearch provides a root component and widgets. The root component
will provide the children a context to let them interact with Algolia. The
widgets are the components who have the ability to interact with the context.

## Widgets

The widgets are plain components that are connected to the instantsearch context.
To make this connection, they are wrapped using our collection of Higher Order
Components that we call connectors.

