export type Flavor = 'react' | 'js';

// Host frameworks with InstantSearch-specific integrations.
// `null` (in downstream types) means the project uses the flavor directly,
// with no framework wrapper.
export type Framework = 'nextjs';

export type AlgoliaCredentials = {
  appId: string;
  searchApiKey: string;
};
