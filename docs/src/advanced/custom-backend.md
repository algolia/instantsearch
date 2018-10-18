---
title: Use your own backend
mainTitle: Advanced
layout: main.pug
category: Advanced
withHeadings: true
navWeight: 4
editable: true
githubSource: docs/src/advanced/custom-backend.md
---

> This guide is compatible with Vue InstantSearch ≥ 1.6.0.

Advanced InstantSearch users may have the need to query Algolia’s servers from their backend instead of the frontend, while still being able to reuse InstantSearch widgets. Possible motivations could be for security restrictions, for SEO purposes or to enrich the data sent by the custom server (i.e. fetch Algolia data and data from their own servers). If this sounds appealing to you, feel free to follow this guide. Keep in mind though that we, at Algolia, [recommend doing frontend search](https://www.algolia.com/doc/faq/searching/searching-from-the-front-end-or-the-back-end/#we-definitely-recommend-frontend-search) for performance and high availability reasons.

By the end of this guide, you will have learned how to leverage InstantSearch with your own backend architecture to query Algolia.

## How it’s made possible

InstantSearch is the UI part on top a search client with a state managed by a [JavaScript Helper](https://github.com/algolia/algoliasearch-helper-js). These three layers are composable and can be interchanged to leverage the InstantSearch widgets system with different search clients.

The [search client](https://github.com/algolia/algoliasearch-client-javascript) that Algolia offers queries Algolia's backends whenever the user refines the search. It is possible to implement your own search client that queries your backend, which then queries Algolia’s backends with the [Algolia search client](https://github.com/algolia/algoliasearch-client-javascript) on your server.

To create your own client, you will need to implement a given interface that receives and returns formatted data that InstantSearch can understand.

## On the backend: create the necessary routes

This guide assumes that you’ve got an existing server running on [http://localhost:3000](http://localhost:3000) with the route `POST /search` that takes the default Algolia query parameters as JSON. This backend could be using the [JavasScript API client](https://www.algolia.com/doc/api-client/javascript/getting-started/) to query Algolia, on top of any other operations you want to perform.

The `algoliasearch` package will allow you to query Algolia from your backend. Here's an example using [Express](https://expressjs.com/):

```javascript
// Instantiate an Algolia client
const algoliasearch = require('algoliasearch');
const algoliaClient = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_API_KEY');

// Add the search endpoint
app.post('/search', async (req, res) => {
  const { requests } = req.body;
  const results = await algoliaClient.search(requests);
  res.status(200).send(results);
});

// Add the searchForFacetValues endpoint
app.post('/sffv', async (req, res) => {
  const { requests } = req.body;
  const results = await algoliaClient.searchForFacetValues(requests);
  res.status(200).send(results);
});
```

Once your new route is ready, we get back to the frontend and are going to create a search client able to communicate with this server.

## On the frontend: call your new backend route

A search client is an object which implements the method `search()`, called every time the user searches and refines results.

```javascript
search: (requests: SearchRequest[]) => Promise<{ results: SearchResponse[] }>
```

The method `searchForFacetValues` is analogue to the `search` method, with as only difference this one will be called if you have a `<ais-refinement-list searchable />`.

Since our server accepts the InstantSearch format as an input, we will only need to pass these requests to our backend in this method, and return the response.

```javascript
const customSearchClient = {
  search(requests) {
    return fetch('http://localhost:3000/search', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }).then(res => res.json());
  },
  searchForFacetValues(requests) {
    return fetch('http://localhost:3000/sffv', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }).then(res => res.json());
  }
};
```

We use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) in this example to query the server; make sure to take note of the [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API#Browser_compatibility) before using it in production.

> If you want to transform the data to be passed to your server, you can learn more about all the parameters that the `search()` method supports in the [Algolia API reference](https://www.algolia.com/doc/api-reference/api-parameters/?language=javascript#parameters-list).

## Using the search client with InstantSearch

Now, we need to tell InstantSearch to use the search client that we’ve created. This is possible with the `searchClient` option. This parameter will disable all Algolia requests coming from the frontend and will proxy them to your own backend implementation.

```html
<ais-index
  index-name="YOUR_INDEX_NAME"
  :searchClient="customSearchClient"
>
  <!-- Add your InstantSearch components here. -->
</ais-index>
```

That’s it! InstantSearch is now requesting your own backend and will display the UI accordingly.

## Going further: enriching data from the backend

Now that you’ve got InstantSearch querying your own backend before fetching results from Algolia, you could merge Algolia’s data to yours to offer your users more exhaustive results.

A recurring problem with e-commerce websites using Algolia is to manage the remaining stock for each product; it is sometimes hard to keep track of the exact number of items. An approach made possible with a custom backend is to only store the item's availability on each Algolia record (`none`, `low`, `medium`, `high`) and to fetch the exact stock on your database.

You need to make a few changes to your backend:

```javascript
app.post('/search', async (req, res) => {
  const requests = req.body;
  const algoliaResults = await algoliaClient.search(requests);
  const results = {
    ...algoliaResults,
    results: algoliaResults.results.map(result => ({
      ...result,
      hits: result.hits.map(async hit => ({
        ...hit,
        // `getStock()` retrieves a product's exact stock from your own database
        stock: await getStock(hit.productID),
      })),
    })),
  };

  res.status(200).send(results);
});
```

You will now be able to access the property `stock` on each hit with InstantSearch on the frontend.

## Conclusion

Throughout this guide, you have learned:

- How to handle Algolia requests coming from InstantSearch on your own backend
- How to create a custom search client calling this server
- How to plug the search client to InstantSearch

This solution is reusable with any other InstantSearch flavor on the web, and on React Native!
