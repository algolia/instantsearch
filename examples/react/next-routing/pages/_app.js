import recommend from '@algolia/recommend';
import algoliasearch from 'algoliasearch';
import singletonRouter from 'next/router';
import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

import '../styles/globals.css';
import 'instantsearch.css/themes/satellite-min.css';

export function algolia(appID, apiKey) {
  const searchClient = algoliasearch(appID, apiKey);
  const recommendClient = recommend(appID, apiKey);

  return { searchClient, recommendClient };
}

const client = algolia('XX85YRZZMV', '098f71f9e2267178bdfc08cc986d2999');

function MyApp({ Component, pageProps }) {
  return (
    <InstantSearch
      client={client}
      indexName="test_FLAGSHIP_ECOM_recommend"
      routing={{
        router: createInstantSearchRouterNext({
          singletonRouter,
        }),
      }}
    >
      <Component {...pageProps} />
    </InstantSearch>
  );
}

export default MyApp;
