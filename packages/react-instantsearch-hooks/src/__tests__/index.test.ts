describe('warnings', () => {
  it('warns on import after release', () => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2023-08-09'));

    expect(() => require('../index')).toWarnDev(
      '[InstantSearch] The package `react-instantsearch-hooks` is replaced by `react-instantsearch-core`. The API is the same, but the package name has changed. Please update your dependencies.'
    );
  });

  it('does not warn on import before release', () => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2023-08-08'));

    expect(() => require('../index')).not.toWarnDev();
  });
});
