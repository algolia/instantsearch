# InstantSearch.js SSR POC

This is a proof of concept for server-side rendering with InstantSearch.js, where the consumer does not themselves render in the server.

## Usage

1. The consumer sets up their configuration of InstantSearch.js in two files. One is a JavaScript file that instantiates InstantSearch.js and adds widgets. The other is an HTML file that contains the markup for the widgets. This could be set up through the dashboard in a later iteration.

```js
// instantsearch-code.js
/* global algoliasearch instantsearch */

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

window.search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  routing: true,
});

window.search.addWidgets([
  instantsearch.widgets.currentRefinements({
    container: '#current-refinements',
  }),
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.refinementList({
    container: '#refinement-list',
    attribute: 'brand',
  }),
  instantsearch.widgets.rangeInput({
    container: '#range',
    attribute: 'price',
  }),
  instantsearch.widgets.toggleRefinement({
    container: '#toggle',
    attribute: 'free_shipping',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) =>
        html`<div>${components.Highlight({ hit, attribute: 'name' })}</div>`,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);
```

The HTML file is split up in different templates, which are used for the base of the server-rendered page.

```html
<!-- instantsearch-code.html -->
<x-template id="header">
  <div id="searchbox"></div>
</x-template>

<x-template id="filters">
  <div id="refinement-list"></div>
  <div id="range"></div>
  <div id="toggle"></div>
</x-template>

<x-template id="body">
  <div id="current-refinements"></div>
  <div id="hits"></div>
  <div id="pagination"></div>
</x-template>

<x-template id="scripts">
  <!-- You can use third-party scripts or code, as in your regular page -->
  <script
    src="https://code.jquery.com/jquery-3.6.4.slim.min.js"
    integrity="sha256-a2yjHM4jnF9f54xUQakjZGaqYs/V1CYvWpoqZzC2/Bw="
    crossorigin="anonymous"
  ></script>
</x-template>

<x-template id="styles">
  <!-- You can set up styles, we make sure they aren't loaded in our server -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/instantsearch.css@8.0.0/themes/satellite-min.css"
  />
</x-template>
```

2. The consumer calls our API in their server and receives different blocks of HTML to render in their page.

```js
async function handler(req, res) {
  const { templates, resources } = await fetch(
    `http://localhost:3000?url=${encodeURIComponent(req.url)}`
  ).then((response) => response.json());

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
  <html>
    <head>
      <meta charset="utf-8" />
      <title>This is the consumer</title>
      ${templates.styles}
      <style>
        body {
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      <header>${templates.header}</header>
      <main style="display: grid; grid-template-columns: 1fr 3fr">
        <div>${templates.filters}</div>
        <div>${templates.body}</div>
      </main>
      ${resources.scripts}
    </body>
  </html>`);
}
```

3. This page then gets rendered in the browser, and the widgets are hydrated.

The consumer code can be found in [consumer-server.js](./consumer-server.js). Their InstantSearch configuration can be found in [instantsearch-code.js](./instantsearch-code.js) and [instantsearch-code.html](./instantsearch-code.html).

## How it works

When the consumer calls our API, we do the following:

1. We load the HTML file in JSDOM.
2. We evaluate the JavaScript file in JSDOM.
3. We execute the search and render the widgets.
4. We extract the HTML templates from the page.
5. We return this, as well as a little script to hydrate the widgets.

The API can be found in [instantsearch-server.js](./instantsearch-server.js).

## Conclusion

It's possible to render InstantSearch.js widgets on the server, without the consumer having to do it themselves. This is a proof of concept, and there are still some things to do:

- Find a safe way to evaluate the JavaScript file. While this is likely running in a sandboxed environment, it's still a security risk. We could use v8 isolates, but that isn't trivial to set up.
- Evaluate the performance of this approach.
  
## Alternatives

- We could use a headless browser instead of JSDOM, but that would be slower.
- We also could use Preact's server rendering, but that would require us to expose the Preact components from the widgets somehow, and not work with custom connectors.

## Questions

- Is a static template enough for consumers, or do they need to read variables that get set in their server runtime. If that would be needed, the instantsearch-code.html file could be passed to the API at runtime, instead of being loaded once.
