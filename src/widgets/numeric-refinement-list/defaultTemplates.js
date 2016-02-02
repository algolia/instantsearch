export default {
  header: '',
  item: `<label class="{{cssClasses.label}}">
  <input type="radio" class="{{cssClasses.checkbox}}" name="{{attributeName}}" {{#isRefined}}checked{{/isRefined}} />{{name}}
</label>`,
  footer: ''
};
