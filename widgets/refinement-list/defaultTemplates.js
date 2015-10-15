module.exports = {
  header: '',
  item: `<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}}
  <span>{{count}}</span>
</label>`,
  footer: ''
};
