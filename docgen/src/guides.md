---
title: What's react-instantsearch? 
layout: main-entry.pug
category: guide
tocVisibility: true
navWeight: 7
---

React-instantsearch is the ultimate toolbox for creating instant search experience using React and Algolia. 
It's built around three pillars: 

* InstantSearch component
* Widgets
* Connectors

## Instant Search

React-instantsearch provides a root component. The root-component will provide a context to 
its children to let them interact with Algolia. 

* [Check out the InstantSearch API documentation.](component/InstantSearch.html) 

## Widgets

React-instantsearch provides a set of widgets that are styled and ready to use.

The widgets are plain components that are connected to the instantsearch context. 
To make this connection, they are wrapped using our collection of Higher Order Components that we call connectors.

* [Check out the widgets API documentation.](/component.html) 

## Connectors

While react-instantsearch already provides widgets out of the box, there are cases where you need to implement 
a custom feature that isn't covered by the default widget set.
 
Connectors are higher order components. They encapsulate the logic for a specific kind of widget 
and they provide a way to interact with the instantsearch context.

Connectors are exposed so that you can create your own widgets very easily.

* [Check out our connectors guide to learn how to use them.](/guides/connectors.html) 
* [Check out the connectors API documentation.](/connector.html) 

## Going further
In order to complete your knowledge of react-instantsearch, we wrote a series
of guides. Each guide covers a specific subject from a practical point of view.

If you think that a subject is not covered [drop us an issue on github](https://github.com/algolia/instantsearch.js/issues).
