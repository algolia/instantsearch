export default {
  item: `<label class="{{cssClasses.label}}">
  <input type="radio" class="{{cssClasses.radio}}" name="{{attribute}}"{{#isRefined}} checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{label}}</span>
</label>`,
};
