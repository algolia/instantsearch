import { withInsights } from '../../lib/insights';
import connectHits from './connectHits';

const connectHitsWithInsights = withInsights(connectHits);

export default connectHitsWithInsights;
