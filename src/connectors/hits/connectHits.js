const connectHits = renderHits => ({
    hitsPerPage = 20,
  } = {}) => ({
    getConfiguration: () => ({hitsPerPage}),
    init({instantSearchInstance}) {
      renderHits({
        hits: [],
        results: undefined,
        instantSearchInstance,
      }, true);
    },
    render({results, instantSearchInstance}) {
      renderHits({
        hits: results.hits,
        results,
        instantSearchInstance,
      }, false);
    },
  });

export default connectHits;
