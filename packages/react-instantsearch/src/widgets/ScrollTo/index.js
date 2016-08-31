import connect from './connect';
import ScrollTo from './ScrollTo';

const Connected = connect(ScrollTo);
Connected.connect = connect;
export default Connected;
