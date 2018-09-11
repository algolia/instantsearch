---
title: Server side rendering
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 2
editable: true
githubSource: docs/src/advanced/server-side-rendering.md
---
> NOTE: this guide has not yet been updated for v2

We have a full example: https://github.com/algolia/vue-instantsearch-examples/tree/master/examples/ssr.

To learn more about how SSR works in Vue.js, read the [official docs](https://ssr.vuejs.org/en/). 

We will not cover how to setup server side rendering with Vue.js, as the official docs already provide this information.

To be able to do server side rendering with Vue InstantSearch, here is what you need to do:

- Write universal code as much as possible
- Create a dedicated server.js entry point that would load the first results and render the initial HTML to display
- Pass down the search state to the frontend
- In the frontend, use the passed state to init the state
