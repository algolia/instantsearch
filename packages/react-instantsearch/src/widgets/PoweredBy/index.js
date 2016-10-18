import connect from './connect';
import PoweredBy from './PoweredBy';

const Connected = connect(PoweredBy);
Connected.connect = connect;
export default Connected;
