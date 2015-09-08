module.exports = {
  InstantSearch: require('./lib/InstantSearch'),
  widgets: {
    hits: require('./widgets/hits'),
    indexSelector: require('./widgets/index-selector'),
    menu: require('./widgets/menu'),
    refinementList: require('./widgets/refinement-list'),
    pagination: require('./widgets/pagination'),
    searchBox: require('./widgets/search-box'),
    stats: require('./widgets/stats'),
    toggle: require('./widgets/toggle')
  }
};
