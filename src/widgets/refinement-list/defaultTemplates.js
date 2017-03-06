export default {
  header: '',
  item: `<label class="{{cssClasses.label}}">
  <input type="checkbox"
         class="{{cssClasses.checkbox}}"
         value="{{name}}"
         {{#isRefined}}checked{{/isRefined}} />
      {{{highlighted}}}
  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>
</label>`,
  footer: '',
};
