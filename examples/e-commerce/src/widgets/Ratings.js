import { panel, ratingMenu } from 'instantsearch.js/es/widgets';
import { collapseButtonText } from '../templates/panel';

const ratingsMenu = panel({
  templates: {
    header: 'Ratings',
    collapseButtonText,
  },
  collapsed: () => false,
  cssClasses: {
    header: 'panel-header',
  },
})(ratingMenu);

const ratings = ratingsMenu({
  container: '#ratings',
  attribute: 'rating',
  templates: {
    item: `
{{#count}}
  <a class="{{cssClasses.link}}" aria-label="{{value}} & up" href="{{href}}">
{{/count}}
{{^count}}
  <div class="{{cssClasses.link}}" aria-label="{{value}} & up" disabled>
{{/count}}
{{#stars}}
  <svg
    class="{{cssClasses.starIcon}} {{#.}}{{cssClasses.fullStarIcon}}{{/.}}{{^.}}{{cssClasses.emptyStarIcon}}{{/.}}"
    aria-hidden="true"
    width="16"
    height="16"
  >
    <path fill-rule="evenodd" d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"/>
  </svg>
{{/stars}}
{{#count}}
  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>
{{/count}}
{{#count}}
  </a>
{{/count}}
{{^count}}
  </div>
{{/count}}
  `,
  },
  cssClasses: {
    item: 'rating-menu-item',
    selectedItem: 'rating-menu-item--selected',
  },
});

export default ratings;
