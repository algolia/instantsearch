import InstantSearch from '../instantsearch';

test('Should register all components when installed', () => {
  const component = jest.fn();
  const Vue = { component };

  InstantSearch.install(Vue);

  const components = [
    'ais-index',
    'ais-highlight',
    'ais-snippet',
    'ais-input',
    'ais-hits',
    'ais-stats',
    'ais-pagination',
    'ais-menu',
    'ais-sort-by-selector',
    'ais-search-box',
    'ais-clear-refinements',
    'ais-configure',
    'ais-no-results',
    'ais-powered-by',
    'ais-breadcrumb',
    'ais-current-refinements',
    'ais-hierarchical-menu',
    'ais-hits-per-page',
  ];

  const allInstalledComponents = component.mock.calls.map(call => call[0]);

  expect(allInstalledComponents).toEqual(components);
});
