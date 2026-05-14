import { safelyRunOnBrowser } from 'instantsearch-core';

import type { PoweredByRenderState } from 'instantsearch-core';

export function usePoweredBy(): PoweredByRenderState {
  const hostname = safelyRunOnBrowser(
    ({ window }) => window.location?.hostname || '',
    { fallback: () => '' }
  );

  return {
    url: `https://www.algolia.com/?utm_source=react-instantsearch&utm_medium=website&utm_content=${hostname}&utm_campaign=poweredby`,
  };
}
