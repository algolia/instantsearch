describe('warnings', () => {
  it('warns on import after release', () => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2023-08-09'));

    expect(() => require('../index')).toWarnDev(
      '[InstantSearch] The package `react-instantsearch-hooks-server` is replaced by `react-instantsearch`. The API is the same, but the package name has changed. Please update your dependencies and follow the migration guide: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/'
    );
  });

  it('does not warn on import before release', () => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2023-08-08'));

    expect(() => require('../index')).not.toWarnDev();
  });
});
