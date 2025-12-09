import * as exports from '../';
import * as exportsUmd from '../index.umd';

describe('exports', () => {
  describe('umd', () => {
    test('has the same number of exports as the main entrypoint', () => {
      expect(Object.keys(exportsUmd).sort()).toEqual(
        Object.keys(exports)
          .filter((key) => key !== 'useStickToBottom')
          .sort()
      );
    });
  });
});
