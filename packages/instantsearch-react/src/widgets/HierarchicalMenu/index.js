import connect from './connect';
import HierarchicalMenu from './HierarchicalMenu';

const Connected = connect(HierarchicalMenu);
Connected.connect = connect;
export default Connected;
