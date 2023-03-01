import { withInsights } from '../../lib/insights';

import connectHits from './connectHits';

import type { Connector } from '../../types';
import type { HitsConnectorParams, HitsWidgetDescription } from './connectHits';

/**
 * Due to https://github.com/microsoft/web-build-tools/issues/1050, we need
 * Connector<...> imported in this file, even though it is only used implicitly.
 * This _uses_ Connector<...> so it is not accidentally removed by someone.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare type ImportWorkaround = Connector<
  HitsWidgetDescription,
  HitsConnectorParams
>;

const connectHitsWithInsights = withInsights(connectHits);

export default connectHitsWithInsights;
