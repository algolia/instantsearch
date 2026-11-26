import { addMissingQueryID, addQueryID } from '../hits-query-id';

describe('addQueryID', () => {
  it('should add __queryID to every hit when given', () => {
    const hits = addQueryID(
      [{ objectID: '1' }, { objectID: '2' }],
      'theQueryID'
    );
    expect(hits[0].__queryID).toEqual('theQueryID');
    expect(hits[1].__queryID).toEqual('theQueryID');
  });

  it('should not add __queryID to every hit when not given', () => {
    const hits = addQueryID([{ objectID: '1' }, { objectID: '2' }], undefined);
    expect(hits[0]).not.toHaveProperty('__queryId');
    expect(hits[1]).not.toHaveProperty('__queryId');
  });
});

describe('addMissingQueryID', () => {
  it('keeps the __queryID a hit already has', () => {
    const hits = addMissingQueryID(
      [{ objectID: '1', __queryID: 'own' }, { objectID: '2' }],
      'fallback'
    );
    expect(hits[0].__queryID).toEqual('own');
    expect(hits[1].__queryID).toEqual('fallback');
  });

  it('returns the hits as-is when no queryID is given', () => {
    const hits = [{ objectID: '1' }];
    expect(addMissingQueryID(hits, undefined)).toBe(hits);
  });
});
