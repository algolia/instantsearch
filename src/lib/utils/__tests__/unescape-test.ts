import unescape from '../unescape';

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
