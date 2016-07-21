import merge from 'lodash/object/merge';
import union from 'lodash/array/union';

export default function mergeStates(state1, state2) {
  return merge(
    {},
    state1,
    state2,
    (a, b) => {
      if (Array.isArray(a)) {
        return union(a, b);
      }

      return undefined;
    }
  );
}
