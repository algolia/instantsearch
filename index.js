module.exports = {
  InstantSearch: require('./lib/InstantSearch'),
  widgets: {
    searchBox: require('./widgets/search-box/'),
    hits: require('./widgets/hits/'),
    pagination: require('./widgets/pagination/'),
    multipleChoiceList: require('./widgets/multiple-choice-list/')
  }
};
