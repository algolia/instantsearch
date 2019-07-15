import { createSingleSearchResponse } from '../createAPIResponse';

describe('createSingleSearchResponse', () => {
  it('calculates nbHits from hits', () => {
    expect(
      createSingleSearchResponse({
        hits: Array.from({ length: 100 }),
      })
    ).toEqual(
      expect.objectContaining({
        nbHits: 100,
      })
    );
  });

  it('calculates nbPages from nbHits & hitsPerPage', () => {
    expect(
      createSingleSearchResponse({
        nbHits: 100,
        hitsPerPage: 20,
      })
    ).toEqual(
      expect.objectContaining({
        nbPages: 5,
      })
    );
  });

  it('calculates nbPages from default nbHits & hitsPerPage', () => {
    expect(createSingleSearchResponse({})).toEqual(
      expect.objectContaining({
        nbPages: 0,
      })
    );
  });
});
