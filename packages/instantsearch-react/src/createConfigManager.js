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
      // @TODO: Provide some sort of warning when two or more components try to
      // set the `hitsPerPage` option to different values.
      typeof res.hitsPerPage !== 'undefined' &&
      typeof config.hitsPerPage !== 'undefined' ?
        Math.max(res.hitsPerPage, config.hitsPerPage) :
        config.hitsPerPage,
  };
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

  helper.search = function(...args) {
    const state = configs.reduce(makeConfig, helper.getState());
    masterHelper.setState(state).search(...args);
    return helper;
  };

  helper.searchOnce = function(...args) {
    const state = configs.reduce(makeConfig, helper.getState());
    masterHelper.setState(state);
    return masterHelper.searchOnce(...args);
  };

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
