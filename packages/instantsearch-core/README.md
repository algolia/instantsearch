# instantsearch-core

Shared implementation behind the InstantSearch flavors (`instantsearch.js`, `react-instantsearch`, `vue-instantsearch`). It is published for dependency and type resolution, but it is not intended for direct end-user use.

Install and import from your flavor package instead: each flavor re-exports this package's public API (connectors, routers, state mappings, middlewares and types).

`instantsearch-core/internal` is reserved for the first-party flavor packages. It has no stability guarantee and can change in any release.
