import InstantSearch from '../instantsearch';

test('Should register all components when installed', () => {
  const component = jest.fn();
  const Vue = { component };

  InstantSearch.install(Vue);

  const components = [
    'ais-index',
    'ais-highlight',
    'ais-snippet',
    'ais-hits',
    'ais-stats',
    'ais-pagination',
    'ais-menu',
    'ais-menu-select',
    'ais-sort-by',
    'ais-search-box',
    'ais-clear-refinements',
    'ais-configure',
    'ais-powered-by',
    'ais-breadcrumb',
    'ais-current-refinements',
    'ais-hierarchical-menu',
    'ais-hits-per-page',
    'ais-infinite-hits',
  ];

  const allInstalledComponents = component.mock.calls.map(call => call[0]);

  expect(allInstalledComponents).toEqual(components);
});
