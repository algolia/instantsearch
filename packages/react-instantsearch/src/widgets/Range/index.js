import connect from './connect';
import Range from './Range';

const Connected = connect(Range);
Connected.connect = connect;
export default Connected;
