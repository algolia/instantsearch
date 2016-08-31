import connect from './connect';
import CurrentFilters from './CurrentFilters';
import ResetComponent from './Reset';

const Connected = connect(CurrentFilters);
Connected.Reset = connect(ResetComponent);
Connected.connect = connect;
export default Connected;
