import connect from './connect';
import Pagination from './Pagination';
import PaginationSelect from './PaginationSelect';

const Connected = connect(Pagination);
Connected.Select = connect(PaginationSelect);
Connected.connect = connect;
export default Connected;
