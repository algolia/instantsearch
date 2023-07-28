declare const __DEV__: boolean;

declare namespace NodeJS {
  // override the type set by Next (in examples), which sets NODE_ENV to readonly globally
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

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

declare module 'react-instantsearch-core-v6' {
  export const InstantSearch: any;
}

declare module 'jest-serializer-html/createSerializer' {
  export default function createSerializer(): jest.SnapshotSerializerPlugin;
}
