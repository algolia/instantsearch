import connect from './connect';
import HitsPerPageLinks from './HitsPerPageLinks';
import HitsPerPageSelect from './HitsPerPageSelect';

const Connected = connect(HitsPerPageLinks);
Connected.Select = connect(HitsPerPageSelect);
Connected.connect = connect;
export default Connected;
