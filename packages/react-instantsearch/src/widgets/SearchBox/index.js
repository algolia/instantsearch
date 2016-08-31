import connect from './connect';
import SearchBox from './SearchBox';

const Connected = connect(SearchBox);
Connected.connect = connect;
export default Connected;
