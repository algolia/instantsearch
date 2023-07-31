const https = require('https');

const { fetchLibraryVersions } = require('../fetchLibraryVersions');

describe('fetchLibraryVersions', () => {
  test('return versions for a library', async () => {
    expect(await fetchLibraryVersions('react-instantsearch')).toEqual(
      expect.arrayContaining([expect.any(String)])
    );
  });

  test('return versions from cache if available', async () => {
    const httpsSpy = jest.spyOn(https, 'get');

    await fetchLibraryVersions('react-instantsearch-core');
    expect(httpsSpy).toHaveBeenCalledTimes(1);

    await fetchLibraryVersions('react-instantsearch-core');
    expect(httpsSpy).toHaveBeenCalledTimes(1);

    await fetchLibraryVersions('instantsearch.js');
    expect(httpsSpy).toHaveBeenCalledTimes(2);
  });
});
