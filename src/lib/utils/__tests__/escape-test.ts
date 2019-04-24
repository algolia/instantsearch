import escape from '../escape';

describe('escape', () => {
  test('should escape values', () => {
    expect(escape('&<>"\'/')).toEqual('&amp;&lt;&gt;&quot;&#39;/');
  });

  test('should escape values in a sentence', () => {
    expect(escape('fred, barney, & pebbles')).toEqual(
      'fred, barney, &amp; pebbles'
    );
  });

  test('should handle strings with nothing to escape', () => {
    expect(escape('abc')).toEqual('abc');
  });

  test('should not escape the "`" character', () => {
    expect(escape('`')).toEqual('`');
  });

  test('should not escape the "/" character', () => {
    expect(escape('/')).toEqual('/');
  });
});
