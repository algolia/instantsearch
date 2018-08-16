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
    'ais-menu',
    'ais-menu-select',
    'ais-numeric-menu',
    'ais-pagination',
    'ais-powered-by',
    'ais-range-input',
    'ais-rating-menu',
    'ais-search-box',
    'ais-snippet',
    'ais-sort-by',
    'ais-stats',
    'ais-toggle-refinement',
  ];

  const allInstalledComponents = component.mock.calls.map(call => call[0]);

  expect(allInstalledComponents).toEqual(components);
});
