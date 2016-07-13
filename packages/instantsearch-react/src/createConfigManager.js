function maybeConcat(dst, src) {
  return src ? dst.concat(src) : dst;
}

function makeConfig(res, config) {
  let hitsPerPage;
  if (typeof config.hitsPerPage !== 'undefined') {
    hitsPerPage = config.hitsPerPage;
  } else if (typeof config.hitsPerPage === 'undefined') {
    hitsPerPage = config.defaultHitsPerPage;
  } else {
    hitsPerPage = res.hitsPerPage;
  }

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
    hitsPerPage,
  };
}

export default function createConfigManager(onApply) {
  const configs = [];
  let updateQueued = false;

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
      onApply();
    },
    getState(initialState) {
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
    },
  };
}
