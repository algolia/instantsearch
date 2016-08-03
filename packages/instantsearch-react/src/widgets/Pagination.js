import connectPagination from '../connectors/connectPagination';
import PaginationImpl from '../impl/Pagination';
export default connectPagination()(PaginationImpl);
