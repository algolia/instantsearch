import { unescape } from '../unescape';

describe('unescape', () => {
  it('unescapes value', () => {
    expect(unescape('fred, barney, &amp; pebbles')).toBe(
      'fred, barney, & pebbles'
    );

    expect(unescape('&amp;&lt;&gt;&quot;&#39;/')).toEqual('&<>"\'/');
  });

  it('handles strings with nothing to unescape', () => {
    expect(unescape('abc')).toEqual('abc');
  });

  it('does not unescape the "`" character', () => {
    expect(unescape('`')).toEqual('`');
  });

  it('does not unescape the "/" character', () => {
    expect(unescape('/')).toEqual('/');
  });

  it('handles strings with tags', () => {
    expect(unescape('<mark>TV &amp; Home Theater</mark>')).toBe(
      '<mark>TV & Home Theater</mark>'
    );
  });
});
