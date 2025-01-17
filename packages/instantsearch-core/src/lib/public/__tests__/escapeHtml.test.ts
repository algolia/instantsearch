import { escape, unescape } from '..';

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

describe('unescape', () => {
  test('should unescape values', () => {
    expect(unescape('&amp;&lt;&gt;&quot;&#39;/')).toEqual('&<>"\'/');
  });

  test('should unescape values in a sentence', () => {
    expect(unescape('fred, barney, &amp; pebbles')).toEqual(
      'fred, barney, & pebbles'
    );
  });

  test('should handle strings with nothing to unescape', () => {
    expect(unescape('abc')).toEqual('abc');
  });

  test('should not unescape the "`" character', () => {
    expect(unescape('`')).toEqual('`');
  });

  test('should not unescape the "/" character', () => {
    expect(unescape('/')).toEqual('/');
  });
});
