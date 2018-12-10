export default {
  item: `<label class="{{cssClasses.label}}">
  <input type="checkbox"
         class="{{cssClasses.checkbox}}"
         value="{{value}}"
         {{#isRefined}}checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{{highlighted}}}</span>
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
