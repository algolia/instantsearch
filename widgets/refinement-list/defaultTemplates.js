module.exports = {
  header: '',
  item: `<label class="{{cssClasses.label}}">
  <input type="checkbox" class="{{cssClasses.checkbox}}" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}}
  <span class="{{cssClasses.count}}">{{count}}</span>
</label>`,
  footer: ''
};
