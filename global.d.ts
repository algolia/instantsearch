declare const __DEV__: boolean;

// incomplete definitions, as we can't explicitly import from @types/algoliasearch
// that package declares the `algoliasearch` module.
// only what we're actually using is declared here
declare module 'algoliasearch-v3' {
  import type algoliasearch from 'algoliasearch';
  type searchClient = ReturnType<typeof algoliasearch>;

  export default function algoliasearch(
    appId: string,
    apiKey: string
  ): {
    search: searchClient['search'];
    addAlgoliaAgent: searchClient['addAlgoliaAgent'];
  };
}
