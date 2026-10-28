import { addAbsolutePosition, addQueryID } from '../hits';

describe('addAbsolutePosition', () => {
  test('starts positions at 1 on page 0', () => {
    const hits = [{ objectID: 'a' }, { objectID: 'b' }];
    const result = addAbsolutePosition(hits, 0, hits.length);

    expect(result).toEqual([
      { objectID: 'a', __position: 1 },
      { objectID: 'b', __position: 2 },
    ]);
  });

  test('offsets positions by page * hitsPerPage', () => {
    const hits = [{ objectID: 'a' }, { objectID: 'b' }];
    const result = addAbsolutePosition(hits, 2, 10);

    expect(result[0].__position).toBe(21);
    expect(result[1].__position).toBe(22);
  });

  test('returns an empty array for empty input', () => {
    expect(addAbsolutePosition([], 0, 20)).toEqual([]);
  });
});

describe('addQueryID', () => {
  test('annotates every hit with the queryID', () => {
    const hits = [{ objectID: 'a' }, { objectID: 'b' }];
    const result = addQueryID(hits, 'q1');

    expect(result).toEqual([
      { objectID: 'a', __queryID: 'q1' },
      { objectID: 'b', __queryID: 'q1' },
    ]);
  });

  test('returns hits unchanged when queryID is undefined', () => {
    const hits = [{ objectID: 'a' }];
    const result = addQueryID(hits, undefined);

    expect(result).toBe(hits);
    expect(result[0]).not.toHaveProperty('__queryID');
  });
});
