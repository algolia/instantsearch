import { withInsights } from '../../lib/insights';
import connectInfiniteHits, {
  InfiniteHitsRendererOptions,
  InfiniteHitsConnectorParams,
} from './connectInfiniteHits';
import { Connector } from '../../types';

/**
 * Due to https://github.com/microsoft/web-build-tools/issues/1050, we need
 * Connector<...> imported in this file, even though it is only used implicitly.
 * This _uses_ Connector<...> so it is not accidentally removed by someone.
 */
declare type ImportWorkaround = Connector<
  InfiniteHitsRendererOptions,
  InfiniteHitsConnectorParams
>;

const connectInfiniteHitsWithInsights = withInsights(connectInfiniteHits);

export default connectInfiniteHitsWithInsights;
