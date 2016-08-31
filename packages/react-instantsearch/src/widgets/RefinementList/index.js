import connect from './connect';
import RefinementList from './RefinementList';
import RefinementListLinks from './RefinementListLinks';

const Connected = connect(RefinementList);
Connected.Links = connect(RefinementListLinks);
Connected.connect = connect;
export default Connected;
