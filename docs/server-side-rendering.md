Server Side Rendering
---------

This guide does not cover how to setup and focuses on how to integrate Vue InstantSearch in a server side rendered application.

To learn more about how SSR works in Vue.js, please checkout the [official docs about SSR](https://ssr.vuejs.org/en/).

## What you will want to achieve

To be able to do server side rendering with Vue InstantSearch, here is what we need to do:

- Make as much code as possible universal (code that can either run in the frontend or in the backend)
- Create a dedicated server.js entrypoint that would load the first results and render the initial HTML to display
- Pass down the search state to the frontend
- In the frontend, use the passed state to init the state

Here is a full example: https://github.com/algolia/vue-instantsearch-examples/tree/master/examples/ssr
