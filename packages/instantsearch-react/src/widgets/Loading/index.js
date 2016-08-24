import connect from './connect';
import Loading from './Loading';

const Connected = connect(Loading);
Connected.connect = connect;
export default Connected;
