import connect from './connect';
import HitsPerPage from './HitsPerPage';
import HitsPerPageSelect from './HitsPerPageSelect';

const Connected = connect(HitsPerPage);
Connected.Select = connect(HitsPerPageSelect);
Connected.connect = connect;
export default Connected;
