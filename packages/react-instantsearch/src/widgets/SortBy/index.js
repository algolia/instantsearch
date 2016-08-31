import connect from './connect';
import SortBy from './SortBy';
import SortByLinks from './SortByLinks';

const Connected = connect(SortBy);
Connected.Links = connect(SortByLinks);
Connected.connect = connect;
export default Connected;
