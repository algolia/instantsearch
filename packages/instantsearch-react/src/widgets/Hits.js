import connectHits from '../connectors/connectHits';
import HitsImpl from '../impl/Hits';
export default connectHits()(HitsImpl);
