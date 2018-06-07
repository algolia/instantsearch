import InstantSearch from '../instantsearch';

test('Should register all components when installed', () => {
  const component = jest.fn();
  const Vue = { component };

  InstantSearch.install(Vue);

  const components = [
    'ais-breadcrumb',
    'ais-clear-refinements',
    'ais-configure',
    'ais-current-refinements',
    'ais-hierarchical-menu',
    'ais-highlight',
    'ais-hits-per-page',
    'ais-hits',
    'ais-index',
    'ais-infinite-hits',
    'ais-menu-select',
    'ais-menu',
    'ais-pagination',
    'ais-powered-by',
    'ais-search-box',
    'ais-snippet',
    'ais-sort-by',
    'ais-stats',
  ];

  const allInstalledComponents = component.mock.calls.map(call => call[0]);

  expect(allInstalledComponents).toEqual(components);
});
