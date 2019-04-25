import uniq from './uniq';
import isPlainObject from './isPlainObject';

/**
 * Deeply merges all the object values in a new object.
 *
 * - Primitive values are replaced
 * - Arrays a concatenated and their values are made unique
 */
function mergeDeep(...values: object[]): object {
  return values.reduce((acc, source = {}) => {
    Object.keys(source).forEach(key => {
      const previousValue = acc[key];
      const nextValue = source[key];

      if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
        acc[key] = uniq([...previousValue, ...nextValue]);
      } else if (isPlainObject(previousValue) && isPlainObject(nextValue)) {
        acc[key] = mergeDeep(previousValue, nextValue);
      } else {
        acc[key] = nextValue;
      }
    });

    return acc;
  }, {});
}

export default mergeDeep;
