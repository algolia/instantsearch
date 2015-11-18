module.exports = {
  header: '',
  item: `<a class="{{cssClasses.link}}{{^count}} {{cssClasses.disabledLink}}{{/count}}" {{#count}}href="{{href}}"{{/count}}>
  {{#stars}}<span class="{{#.}}{{cssClasses.star}}{{/.}}{{^.}}{{cssClasses.emptyStar}}{{/.}}"></span>{{/stars}}
  {{labels.andUp}}
  {{#count}}<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>{{/count}}
</a>`,
  footer: ''
};
