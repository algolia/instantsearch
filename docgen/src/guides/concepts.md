---
title: Concepts overview
layout: main.pug
name: concepts
category: guides
withHeadings: true
navWeight: 0
---

Instantsearch.js is a dependency-free JS library to build immersive
search experience with Algolia. This guide will go through the different
building blocks of this library.

## The core

The core of the library bridges Algolia to UI elements that we call widgets.

Like a solar system, the core is the sun and the widgets the planets.

The main API of the `instantsearch` instances is `addWidget`. This API

## Widgets

The widgets are UI elements connected to Algolia. They contain two aspects:
 - the business logic to translate the UI into algolia parameters and vice versa
 - the visual look of the UI or rendering

## Connectors

Connectors are the widgets without the rendering. They only contains the UX / business
logic of widgets. Most bundled widget in instantsearch.js is based on connectors. They
provide a great deal of visual customization providing you with what we know best: search.

## The search state

All of those elements interact with a single source of truth for the search.
