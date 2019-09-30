import { transformSync } from '@babel/core';
import wrapWarningWithDevCheck from '../wrap-warning-with-dev-check';

function babelTransform(code) {
  return transformSync(code, {
    configFile: false,
    plugins: [wrapWarningWithDevCheck],
  }).code;
}

describe('wrap-warning-with-dev-check', () => {
  test('should wrap warning calls', () => {
    expect(babelTransform("warning(condition, 'message');")).toEqual(
      "__DEV__ ? warning(condition, 'message') : void 0;"
    );
  });

  test('should not wrap other calls', () => {
    expect(babelTransform("deprecate(fn, 'message');")).toEqual(
      "deprecate(fn, 'message');"
    );
  });
});
