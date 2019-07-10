import { Index } from '../../widgets/index/index';
import { SearchParameters } from '../../types';

const resolveSearchParameters = (current: Index): SearchParameters[] => {
  let parent = current.getParent();
  let states = [current.getHelper()!.state];

  while (parent !== null) {
    states = [parent.getHelper()!.state].concat(states);
    parent = parent.getParent();
  }

  return states;
};

export default resolveSearchParameters;
