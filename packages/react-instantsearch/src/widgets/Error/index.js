import connect from './connect';
import ErrorComponent from './Error';

const Connected = connect(ErrorComponent);
Connected.connect = connect;
export default Connected;
