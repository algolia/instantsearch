import { SearchParameters } from 'algoliasearch-helper';
import { IndexWidget } from '../../widgets/index/index';

const resolveSearchParameters = (current: IndexWidget): SearchParameters[] => {
  let parent = current.getParent();
  let states = [current.getHelper()!.state];

  while (parent !== null) {
    states = [parent.getHelper()!.state].concat(states);
    parent = parent.getParent();
  }

  return states;
};

export default resolveSearchParameters;
