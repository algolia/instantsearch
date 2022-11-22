import { addAbsolutePosition } from '../hits-absolute-position';

describe('addAbsolutePosition', () => {
  it('should equal index + 1 on first page (page 0)', () => {
    const hits = addAbsolutePosition(
      [{ objectID: '1' }, { objectID: '2' }],
      0,
      2
    );
    expect(hits[0].__position).toEqual(1);
    expect(hits[1].__position).toEqual(2);
  });
  it('should add offset of 2 on second page (page 1)', () => {
    const hits = addAbsolutePosition(
      [{ objectID: '1' }, { objectID: '2' }],
      1,
      2
    );
    expect(hits[0].__position).toEqual(3);
    expect(hits[1].__position).toEqual(4);
  });
});
