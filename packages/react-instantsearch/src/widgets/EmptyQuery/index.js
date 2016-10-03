/**
 * @module widgets/EmptyQuery
 */
import connect from './connect';
import EmptyQueryComponent from './EmptyQuery';

/**
 * Conditional component that only renders its single child when the current query is empty.
 * This widget is particularly useful if you want to integrate your search in a content page.
 * @kind component
 * @category widget
 * @propType {string} queryId - the ID used by the search box to store the query data.
 */
const EmptyQuery = connect(EmptyQueryComponent);
EmptyQuery.connect = connect;
export default EmptyQuery;
