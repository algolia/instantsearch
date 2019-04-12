import { withInsights } from '../../lib/insights';
import connectInfiniteHits from './connectInfiniteHits';

const connectInfiniteHitsWithInsights = withInsights(connectInfiniteHits);

export default connectInfiniteHitsWithInsights;
