import instantsearch from '../main.js';
import forEach from 'lodash/forEach';

describe('instantsearch()', () => {
  // to ensure the global.window is set

  it('includes a version', () => {
    expect(instantsearch.version).toMatch(
      /^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/
    );
  });

  it('includes the widget functions', () => {
    forEach(instantsearch.widgets, widget => {
      expect(typeof widget).toEqual('function', 'A widget must be a function');
    });
  });

  it('includes the connectors functions', () => {
    forEach(instantsearch.connectors, connector => {
      expect(typeof connector).toEqual(
        'function',
        'A connector must be a function'
      );
    });
  });

  it('includes the highlight helper function', () => {
    expect(typeof instantsearch.highlight).toEqual(
      'function',
      'THe highlight helper must be a function'
    );
  });
});
