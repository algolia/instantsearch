import { endsInsideRootProperty, getJsonCursor } from '../jsonCursor';

describe('getJsonCursor', () => {
  test('tracks the containers open at the end of the document', () => {
    const { frames, inString } = getJsonCursor(
      '{"objectIDs": ["A"], "criteria": [{"label": "Price", "values": ["$1", '
    );

    expect(inString).toBe(false);
    expect(frames.map((frame) => frame.key)).toEqual([
      '',
      'criteria',
      '',
      'values',
    ]);
    expect(frames[2].lastKey).toBe('values');
  });

  test('tells a property name under the cursor from a value', () => {
    expect(getJsonCursor('{"objectIDs": ["A"], "crit')).toMatchObject({
      inString: true,
      isKey: true,
    });
    expect(getJsonCursor('{"intro": "Two solid')).toMatchObject({
      inString: true,
      isKey: false,
    });
  });

  test('ignores brackets and quotes inside strings', () => {
    const { frames, inString } = getJsonCursor(
      '{"intro": "a [bracket] and a \\" quote", "objectIDs": ['
    );

    expect(inString).toBe(false);
    expect(frames.map((frame) => frame.key)).toEqual(['', 'objectIDs']);
  });

  test('decodes escaped property names', () => {
    const { frames } = getJsonCursor('{"object\\u0049Ds": [');

    expect(frames[1].key).toBe('objectIDs');
  });

  test('counts the entries started in each open container', () => {
    const { frames } = getJsonCursor(
      '{"objectIDs": ["A", "B"], "criteria": [{"label": "Price", "values": [4, null, "x"]}, {"'
    );

    // root: objectIDs, criteria · criteria: two rows (the second just opened)
    // · row: one property name under the cursor
    expect(frames.map((frame) => frame.items)).toEqual([2, 2, 1]);
    expect(getJsonCursor('["a", 1, true, {"k": 1}, [').frames[0].items).toBe(5);
    expect(getJsonCursor('["a", ').frames[0].items).toBe(1);
  });

  test('reports a trailing escape inside a string', () => {
    expect(getJsonCursor('{"intro": "a \\')).toMatchObject({
      inString: true,
      isEscaped: true,
    });
    expect(getJsonCursor('{"intro": "a \\\\')).toMatchObject({
      inString: true,
      isEscaped: false,
    });
  });

  test('is empty once the document has closed', () => {
    expect(getJsonCursor('{"objectIDs": ["A"]}').frames).toEqual([]);
  });
});

describe('endsInsideRootProperty', () => {
  test('is true while the property is an open container', () => {
    expect(
      endsInsideRootProperty(
        getJsonCursor('{"objectIDs": ["A", "B'),
        'objectIDs'
      )
    ).toBe(true);
    expect(
      endsInsideRootProperty(
        getJsonCursor('{"objectIDs": ["A"], "criteria": [{"label": "P'),
        'criteria'
      )
    ).toBe(true);
  });

  test('is true while the property is an open string', () => {
    expect(
      endsInsideRootProperty(getJsonCursor('{"intro": "Two solid'), 'intro')
    ).toBe(true);
  });

  test('is false once the property has closed or another one is being written', () => {
    expect(
      endsInsideRootProperty(
        getJsonCursor('{"objectIDs": ["A", "B"]'),
        'objectIDs'
      )
    ).toBe(false);
    expect(
      endsInsideRootProperty(
        getJsonCursor('{"objectIDs": ["A"], "criteria": [{"label": "P'),
        'objectIDs'
      )
    ).toBe(false);
    // A property *name* being typed is not that property's value.
    expect(
      endsInsideRootProperty(
        getJsonCursor('{"objectIDs": ["A"], "intro'),
        'intro'
      )
    ).toBe(false);
  });

  test('is false outside a root object', () => {
    expect(endsInsideRootProperty(getJsonCursor(''), 'objectIDs')).toBe(false);
    expect(endsInsideRootProperty(getJsonCursor('["A"'), 'objectIDs')).toBe(
      false
    );
  });
});
