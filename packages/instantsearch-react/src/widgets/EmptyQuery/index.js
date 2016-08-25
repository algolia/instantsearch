import connect from './connect';
import EmptyQuery from './EmptyQuery';

const Connected = connect(EmptyQuery);
Connected.connect = connect;
export default Connected;
