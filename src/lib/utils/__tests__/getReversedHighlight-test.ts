import getReversedHighlight from '../getReversedHighlight';

describe('getReversedHighlight', () => {
  describe('reverse highlighted parts in a string', () => {
    test('with an empty string', () => {
      expect(getReversedHighlight('')).toEqual('');
    });

    test('with space only string', () => {
      expect(getReversedHighlight('         ')).toEqual('         ');
    });

    test('with one match', () => {
      expect(getReversedHighlight('this is a <mark>match</mark>')).toEqual(
        '<mark>this</mark> <mark>is</mark> <mark>a</mark> match'
      );
    });

    test('with full match', () => {
      expect(
        getReversedHighlight(
          '<mark>this</mark> <mark>is</mark> <mark>full</mark> <mark>match</mark>'
        )
      ).toEqual('this is full match');
    });

    test('with full match in one word', () => {
      expect(getReversedHighlight('<mark>MATCH</mark>')).toEqual('MATCH');
    });

    test('with a match with HTML entities', () => {
      expect(
        getReversedHighlight(
          'fred, &amp; &lt;&gt;&quot;&#39;/ <mark>barney</mark>, &amp; pebbles'
        )
      ).toEqual('<mark>fred</mark>, & <>"\'/ barney, & <mark>pebbles</mark>');
    });
  });
});
