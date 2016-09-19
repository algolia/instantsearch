import connect from './connect';
import RangeInput from './RangeInput';
import Range from './Range';

const Connected = connect(Range);
Connected.Input = connect(RangeInput);
Connected.connect = connect;
export default Connected;
