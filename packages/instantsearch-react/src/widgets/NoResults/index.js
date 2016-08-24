import connect from './connect';
import NoResults from './NoResults';

const Connected = connect(NoResults);
Connected.connect = connect;
export default Connected;
