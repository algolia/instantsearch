import * as hooks from '../';
import * as hooksUmd from '../index.umd';

describe('hooks', () => {
  describe('umd', () => {
    test('has the same number of exports as the main entrypoint', () => {
      expect(Object.keys(hooksUmd).sort()).toEqual(Object.keys(hooks).sort());
    });
  });
});
