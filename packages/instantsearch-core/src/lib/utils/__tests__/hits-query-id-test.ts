import { addQueryID } from '../hits-query-id';

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
