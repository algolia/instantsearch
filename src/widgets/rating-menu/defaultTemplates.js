export default {
  item: `{{#count}}<a class="{{cssClasses.link}}" aria-label="{{value}} & up" href="{{href}}">{{/count}}{{^count}}<div class="{{cssClasses.link}}" aria-label="{{value}} & up" disabled>{{/count}}
  {{#stars}}<svg class="{{cssClasses.starIcon}} {{#.}}{{cssClasses.fullStarIcon}}{{/.}}{{^.}}{{cssClasses.emptyStarIcon}}{{/.}}" aria-hidden="true" width="24" height="24">
    {{#.}}<use xlink:href="#ais-RatingMenu-starSymbol"></use>{{/.}}{{^.}}<use xlink:href="#ais-RatingMenu-starEmptySymbol"></use>{{/.}}
  </svg>{{/stars}}
  <span class="{{cssClasses.label}}">{{labels.andUp}}</span>
  {{#count}}<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>{{/count}}
{{#count}}</a>{{/count}}{{^count}}</div>{{/count}}`,
};
