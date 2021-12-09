import type { HierarchicalMenuComponentTemplates } from './hierarchical-menu';
const defaultTemplates: HierarchicalMenuComponentTemplates = {
  item:
    '<a class="{{cssClasses.link}}" href="{{url}}">' +
    '<span class="{{cssClasses.label}}">{{label}}</span>' +
    '<span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>' +
    '</a>',
  showMoreText: `
    {{#isShowingMore}}
      Show less
    {{/isShowingMore}}
    {{^isShowingMore}}
      Show more
    {{/isShowingMore}}
  `,
};

export default defaultTemplates;
