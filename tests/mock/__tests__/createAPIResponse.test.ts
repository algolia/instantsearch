import {
  createSFFVResponse,
  createSingleSearchResponse,
} from '../createAPIResponse';

describe('createSingleSearchResponse', () => {
  test('calculates nbHits from hits', () => {
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

  test('calculates nbPages from nbHits and hitsPerPage', () => {
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

  test('calculates nbPages from default nbHits and hitsPerPage', () => {
    expect(createSingleSearchResponse({})).toEqual(
      expect.objectContaining({
        nbPages: 0,
      })
    );
  });

  test('allows to override params', () => {
    expect(
      createSingleSearchResponse({
        query: 'custom query',
        processingTimeMS: 10,
      })
    ).toEqual(
      expect.objectContaining({
        query: 'custom query',
        processingTimeMS: 10,
      })
    );
  });
});

describe('createSFFVResponse', () => {
  test('allows to override params', () => {
    expect(
      createSFFVResponse({
        processingTimeMS: 10,
      })
    ).toEqual(
      expect.objectContaining({
        processingTimeMS: 10,
      })
    );
  });
});
