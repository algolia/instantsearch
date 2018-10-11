export default {
  item:
    '<a class="{{cssClasses.link}}" href="{{url}}">' +
    '<span class="{{cssClasses.label}}">{{label}}</span>' +
    '<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>' +
    '</a>',
  showMoreActive: 'Show less',
  showMoreInactive: 'Show more',
};
