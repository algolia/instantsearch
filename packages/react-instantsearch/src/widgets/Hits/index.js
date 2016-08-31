import connect from './connect';
import Hits from './Hits';

const Connected = connect(Hits);
Connected.connect = connect;
export default Connected;
