import { withInsights } from '../../lib/insights';
import connectHits, {
  HitsRendererOptions,
  HitsConnectorParams,
} from './connectHits';
import { Connector } from '../../types';

/**
 * Due to https://github.com/microsoft/web-build-tools/issues/1050, we need
 * Connector<...> imported in this file, even though it is only used implicitly.
 * This _uses_ Connector<...> so it is not accidentally removed by someone.
 */
declare type ImportWorkaround = Connector<
  HitsRendererOptions,
  HitsConnectorParams
>;

const connectHitsWithInsights = withInsights(connectHits);

export default connectHitsWithInsights;
