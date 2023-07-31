import { safelyRunOnBrowser } from 'instantsearch.js/es/lib/utils';

import type { PoweredByRenderState } from 'instantsearch.js/es/connectors/powered-by/connectPoweredBy';

export function usePoweredBy(): PoweredByRenderState {
  const hostname = safelyRunOnBrowser(
    ({ window }) => window.location?.hostname || '',
    { fallback: () => '' }
  );

  return {
    url: `https://www.algolia.com/?utm_source=react-instantsearch&utm_medium=website&utm_content=${hostname}&utm_campaign=poweredby`,
  };
}
