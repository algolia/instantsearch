import { SearchParameters } from 'algoliasearch-helper';
import { Index } from '../../widgets/index/index';

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
