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
    'ais-results',
    'ais-stats',
    'ais-pagination',
    'ais-results-per-page-selector',
    'ais-tree-menu',
    'ais-menu',
    'ais-sort-by-selector',
    'ais-search-box',
    'ais-clear-refinements',
    'ais-configure',
    'ais-rating',
    'ais-range-input',
    'ais-no-results',
    'ais-refinement-list',
    'ais-price-range',
    'ais-powered-by',
    'ais-breadcrumb',
    'ais-current-refinements',
    'ais-hierarchical-menu',
  ];

  const allInstalledComponents = component.mock.calls.map(call => call[0]);

  expect(allInstalledComponents).toEqual(components);
  expect(components).toHaveLength(23);
  expect(component).toHaveBeenCalledTimes(23);
});
