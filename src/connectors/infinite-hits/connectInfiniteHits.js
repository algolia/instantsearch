const connectInfiniteHits = infiniteHitsRendering => ({
  showMoreLabel = 'Show more results',
  hitsPerPage = 20,
} = {}) => {
  let hitsCache = [];
  const getShowMore = helper => () => helper.nextPage().search();

  return {
    getConfiguration: () => ({hitsPerPage}),
    init({instantSearchInstance, helper}) {
      this.showMore = getShowMore(helper);

      infiniteHitsRendering({
        hits: hitsCache,
        results: undefined,
        showMore: this.showMore,
        showMoreLabel,
        isLastPage: true,
        instantSearchInstance,
      }, true);
    },
    render({results, state, instantSearchInstance}) {
      if (state.page === 0) {
        hitsCache = [];
      }

      hitsCache = [...hitsCache, ...results.hits];

      const isLastPage = results.nbPages <= results.page + 1;

      infiniteHitsRendering({
        hits: hitsCache,
        results,
        showMore: this.showMore,
        showMoreLabel,
        isLastPage,
        instantSearchInstance,
      }, false);
    },
  };
};

export default connectInfiniteHits;
