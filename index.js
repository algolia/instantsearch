module.exports = {
  InstantSearch: require('./lib/InstantSearch'),
  widgets: {
    hits: require('./widgets/hits'),
    menu: require('./widgets/menu'),
    multipleChoiceList: require('./widgets/multiple-choice-list'),
    pagination: require('./widgets/pagination'),
    searchBox: require('./widgets/search-box'),
    stats: require('./widgets/stats'),
    toggle: require('./widgets/toggle')
  }
};
