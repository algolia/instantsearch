/* eslint-disable max-len */
export default {
  header: '',
  item:
    '<a class="{{cssClasses.link}}" href="{{url}}">{{label}} <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span></a>',
  footer: '',
  'show-more-active':
    '<button class="ais-HierarchicalMenu-showMore">Show less</button>',
  'show-more-inactive':
    '<button class="ais-HierarchicalMenu-showMore">Show more</button>',
};
