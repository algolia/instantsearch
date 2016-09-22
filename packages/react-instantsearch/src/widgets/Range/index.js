import connect from './connect';
import RangeInput from './RangeInput';
import RangeRatings from './RangeRatings';
import Range from './Range';

const Connected = connect(Range);
Connected.Input = connect(RangeInput);
Connected.Rating = connect(RangeRatings);
Connected.connect = connect;
export default Connected;
