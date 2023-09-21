import type { IndexWidget } from '../../widgets/index/index';
import type { SearchParameters } from 'algoliasearch-helper';

export function resolveSearchParameters(
  current: IndexWidget
): SearchParameters[] {
  let parent = current.getParent();
  let states = [current.getHelper()!.state];

  while (parent !== null) {
    states = [parent.getHelper()!.state].concat(states);
    parent = parent.getParent();
  }

  return states;
}
