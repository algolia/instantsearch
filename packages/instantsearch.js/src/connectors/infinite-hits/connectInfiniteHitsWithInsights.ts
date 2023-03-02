import { withInsights } from '../../lib/insights';

import connectInfiniteHits from './connectInfiniteHits';

import type { Connector } from '../../types';
import type {
  InfiniteHitsWidgetDescription,
  InfiniteHitsConnectorParams,
} from './connectInfiniteHits';

/**
 * Due to https://github.com/microsoft/web-build-tools/issues/1050, we need
 * Connector<...> imported in this file, even though it is only used implicitly.
 * This _uses_ Connector<...> so it is not accidentally removed by someone.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare type ImportWorkaround = Connector<
  InfiniteHitsWidgetDescription,
  InfiniteHitsConnectorParams
>;

const connectInfiniteHitsWithInsights = withInsights(connectInfiniteHits);

export default connectInfiniteHitsWithInsights;
