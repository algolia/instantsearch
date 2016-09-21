import connect from './connect';
import MultiRange from './MultiRange';

const Connected = connect(MultiRange);
Connected.connect = connect;
export default Connected;
