/* eslint-disable import/no-commonjs */

import transformProps from './transformProps';

module.exports = function transformPropsLoader(content) {
  try {
    const transformed = transformProps(content);
    return transformed;
  } catch (e) {
    return content;
  }
};
