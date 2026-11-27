import { getStatsAnnouncementText, getStatsText } from '../stats';

describe('getStatsText', () => {
  test.each([
    [{ nbHits: 0, processingTimeMS: 0 }, 'No results found in 0ms'],
    [{ nbHits: 1, processingTimeMS: 50 }, '1 result found in 50ms'],
    [{ nbHits: 1234, processingTimeMS: 42 }, '1,234 results found in 42ms'],
    [
      { nbHits: 1234, processingTimeMS: 1234 },
      '1,234 results found in 1,234ms',
    ],
    [
      {
        nbHits: 1234,
        nbSortedHits: 0,
        areHitsSorted: true,
        processingTimeMS: 42,
      },
      'No relevant results sorted out of 1,234 found in 42ms',
    ],
    [
      {
        nbHits: 1234,
        nbSortedHits: 1,
        areHitsSorted: true,
        processingTimeMS: 42,
      },
      '1 relevant result sorted out of 1,234 found in 42ms',
    ],
    [
      {
        nbHits: 1234,
        nbSortedHits: 1150,
        areHitsSorted: true,
        processingTimeMS: 42,
      },
      '1,150 relevant results sorted out of 1,234 found in 42ms',
    ],
  ])('%o', (options, expected) => {
    expect(getStatsText(options)).toBe(expected);
  });
});

describe('getStatsAnnouncementText', () => {
  test('omits the processing time', () => {
    expect(getStatsAnnouncementText({ nbHits: 5 })).toBe('5 results');
    expect(
      getStatsAnnouncementText({
        nbHits: 1234,
        nbSortedHits: 150,
        areHitsSorted: true,
      })
    ).toBe('150 relevant results sorted out of 1,234');
  });
});
