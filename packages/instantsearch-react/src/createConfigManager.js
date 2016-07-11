import algoliasearchHelper from 'algoliasearch-helper';

function maybeConcat(dst, src) {
  return src ? dst.concat(src) : dst;
}

function makeConfig(res, config) {
  return {
    ...res,
    facets: maybeConcat(res.facets, config.facets),
    disjunctiveFacets: maybeConcat(res.disjunctiveFacets, config.disjunctiveFacets),
    hierarchicalFacets: maybeConcat(res.hierarchicalFacets, config.hierarchicalFacets),
    numericRefinements: {
      ...config.numericRefinements,
      ...res.numericRefinements,
    },
    maxValuesPerFacet:
      typeof config.valuesPerFacet !== 'undefined' ?
        Math.max(res.maxValuesPerFacet, config.valuesPerFacet) :
        res.maxValuesPerFacet,
    hitsPerPage:
      typeof config.hitsPerPage !== 'undefined' ?
        config.hitsPerPage :
      typeof res.hitsPerPage === 'undefined' ?
        config.defaultHitsPerPage :
        res.hitsPerPage,
  };
}

function getState(helper, configs) {
  const initialState = helper.getState();
  if (
    typeof initialState.hitsPerPage !== 'undefined' &&
    configs.some(c => typeof c.hitsPerPage !== 'undefined')
  ) {
    throw new Error(
      'Config conflict: a component is defining `hitsPerPage` in its ' +
      'config, but the `AlgoliaSearchHelper` already has one.\n' +
      'This usually means that you have rendered both a `<Hits>` component ' +
      'with a `hitsPerPage` prop and a `<HitsPerPage>` component. In this ' +
      'case, you should remove the  `hitsPerPage` prop from the `<Hits>` ' +
      'component.'
    );
  }
  return configs.reduce(makeConfig, initialState);
}

export default function createConfigManager(helper) {
  const configs = [];
  let updateQueued = false;

  // We need to create a new helper that will contain both the user config
  // defined on helper and the default config.
  // This is important because we do not want to persist the default config
  // in the provided helper's state, which controls the URL sync. The provided
  // helper should only ever be changed from a user action.
  const masterHelper = algoliasearchHelper(helper.client, helper.index);

  const {search, searchOnce} = helper;

  // @TODO: This is way too hacky. We need a way to add a state middleware to
  // the helper in order to edit the SearchParameters of every search.
  helper.search = function(...args) {
    const state = getState(helper, configs);
    masterHelper.setState(state).search(...args);
    return helper;
  };

  helper.searchOnce = function(...args) {
    const state = getState(helper, configs);
    masterHelper.setState(state);
    return masterHelper.searchOnce(...args);
  };

  masterHelper.on('change', (...args) => {
    helper.emit('change', ...args);
  });

  masterHelper.on('search', (...args) => {
    helper.emit('search', ...args);
  });

  masterHelper.on('result', (...args) => {
    helper.emit('result', ...args);
  });

  masterHelper.on('error', (...args) => {
    helper.emit('error', ...args);
  });

  return {
    register(config) {
      configs.push(config);
      updateQueued = true;
    },
    swap(config, nextConfig) {
      configs.splice(configs.indexOf(config), 1, nextConfig);
      updateQueued = true;
    },
    unregister(config) {
      configs.splice(configs.indexOf(config), 1);
      updateQueued = true;
    },
    apply() {
      if (!updateQueued) {
        return;
      }
      updateQueued = false;
      helper.search();
    },
    unbind() {
      helper.search = search;
      helper.searchOnce = searchOnce;
    },
  };
}
