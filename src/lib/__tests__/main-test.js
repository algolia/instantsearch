import instantsearch from '../main.js';
import forEach from 'lodash/forEach';
import expect from 'expect';

describe('instantsearch()', () => {
  // to ensure the global.window is set

  it('includes a version', () => {
    expect(instantsearch.version).toMatch(
      /^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/
    );
  });

  it('statically creates a URL', () => {
    expect(instantsearch.createQueryString({ hitsPerPage: 42 })).toEqual(
      'hPP=42'
    );
  });

  it('statically creates a complex URL', () => {
    expect(
      instantsearch.createQueryString({
        hitsPerPage: 42,
        facetsRefinements: { category: 'Home' },
      })
    ).toEqual('hPP=42&fR[category]=Home');
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
});
