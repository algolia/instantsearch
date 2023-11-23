import algoliasearch from 'algoliasearch/lite';
// import recommend from '@algolia/recommend';

export function algolia(appID, apiKey) {
  const searchClient = algoliasearch(appID, apiKey);
  // const recommendClient = recommend(appID, apiKey);

  return {
    searchClient,
    // recommendClient,
  };
}
