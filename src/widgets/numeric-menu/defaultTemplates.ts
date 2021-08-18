import type { NumericMenuComponentTemplates } from './numeric-menu';

const defaultTemplates: NumericMenuComponentTemplates = {
  item: `<label class="{{cssClasses.label}}">
  <input type="radio" class="{{cssClasses.radio}}" name="{{attribute}}"{{#isRefined}} checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{label}}</span>
</label>`,
};

export default defaultTemplates;
