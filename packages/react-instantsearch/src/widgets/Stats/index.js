import connect from './connect';
import Stats from './Stats';

const Connected = connect(Stats);
Connected.connect = connect;
export default Connected;
