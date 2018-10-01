/* eslint-disable max-len */
export default {
  item: `<label class="{{cssClasses.label}}">
  <input type="radio" class="{{cssClasses.radio}}" name="{{attributeName}}" {{#isRefined}}checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{label}}</span>
</label>`,
};
