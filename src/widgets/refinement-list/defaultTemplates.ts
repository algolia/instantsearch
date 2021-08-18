import type { RefinementListComponentTemplates } from './refinement-list';

const defaultTemplates: RefinementListComponentTemplates = {
  item: `<label class="{{cssClasses.label}}">
  <input type="checkbox"
         class="{{cssClasses.checkbox}}"
         value="{{value}}"
         {{#isRefined}}checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{#isFromSearch}}{{{highlighted}}}{{/isFromSearch}}{{^isFromSearch}}{{highlighted}}{{/isFromSearch}}</span>
  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>
</label>`,
  showMoreText: `
    {{#isShowingMore}}
      Show less
    {{/isShowingMore}}
    {{^isShowingMore}}
      Show more
    {{/isShowingMore}}
    `,
  searchableNoResults: 'No results',
};

export default defaultTemplates;
