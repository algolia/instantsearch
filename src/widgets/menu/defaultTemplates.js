/* eslint-disable max-len */
export default {
  item:
    '<a class="{{cssClasses.link}}" href="{{url}}">' +
    '<span class="{{cssClasses.label}}">{{label}}</span>' +
    '<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>' +
    '</a>',
  searchableNoResults: 'No results',
  showMoreActive: 'Show less',
  showMoreInactive: 'Show more',
};
