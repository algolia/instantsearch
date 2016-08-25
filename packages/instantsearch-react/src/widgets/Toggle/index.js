import connect from './connect';
import Toggle from './Toggle';

const Connected = connect(Toggle);
Connected.connect = connect;
export default Connected;
