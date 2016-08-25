import connect from './connect';
import NumericRefinementList from './NumericRefinementList';

const Connected = connect(NumericRefinementList);
Connected.connect = connect;
export default Connected;
