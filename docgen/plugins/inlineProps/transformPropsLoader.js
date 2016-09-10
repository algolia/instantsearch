/* eslint-disable import/no-commonjs */

import memoize from 'memoizee';
import rawTransformProps from './transformProps';

const transformProps = memoize(rawTransformProps);

module.exports = function transformPropsLoader(content) {
  try {
    const transformed = transformProps(content);
    return transformed;
  } catch (e) {
    return content;
  }
};
