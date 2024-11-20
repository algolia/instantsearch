import { createInsightsMiddleware } from 'instantsearch-core';

import type { InsightsClient } from 'instantsearch-core';

export type {
  InsightsClient,
  InsightsMethod,
  InsightsEvent,
  InsightsProps,
} from 'instantsearch-core';

export type InsightsClientWithGlobals = InsightsClient & {
  shouldAddScript?: boolean;
  version?: string;
};
export type CreateInsightsMiddleware = typeof createInsightsMiddleware;
export { createInsightsMiddleware };
