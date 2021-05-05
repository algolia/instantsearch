import instantsearch from '../main';

describe('instantsearch()', () => {
  it('includes a version', () => {
    expect(instantsearch.version).toMatch(
      /^(\d+\.)?(\d+\.)?(\*|\d+)(-beta.\d+)?$/
    );
  });

  it('includes the widget functions', () => {
    Object.values(instantsearch.widgets).forEach(widget => {
      expect(widget).toBeInstanceOf(Function);
    });
  });

  it('includes the connectors functions', () => {
    Object.values(instantsearch.connectors).forEach(connector => {
      expect(connector).toBeInstanceOf(Function);
    });
  });

  it('includes the highlight helper function', () => {
    expect(instantsearch.highlight).toBeInstanceOf(Function);
  });
});
