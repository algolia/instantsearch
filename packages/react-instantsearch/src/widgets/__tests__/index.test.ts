import * as widgets from '../';
import * as widgetsUmd from '../index.umd';

describe('widgets', () => {
  describe('umd', () => {
    test('has the same number of exports as the main entrypoint', () => {
      expect(Object.keys(widgetsUmd).sort()).toEqual(
        Object.keys(widgets).sort()
      );
    });
  });
});
