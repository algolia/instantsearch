Server Side Rendering
---------

This guide does not cover how to setup server side rendering with Vue.js but focuses instead on how to integrate Vue InstantSearch in an existing server side rendered application.

To learn more about how SSR works in Vue.js, there is the [official docs about SSR](https://ssr.vuejs.org/en/).

## What you will want to achieve

To be able to do server side rendering with Vue InstantSearch, here is what we need to do:

- Write universal code as much as possible
- Create a dedicated server.js entry point that would load the first results and render the initial HTML to display
- Pass down the search state to the frontend
- In the frontend, use the passed state to init the state

Here is a full example: https://github.com/algolia/vue-instantsearch-examples/tree/master/examples/ssr
