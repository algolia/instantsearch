/** @jsx h */
import { h } from 'preact';

import type { NumericMenuComponentTemplates } from './numeric-menu';

const defaultTemplates: NumericMenuComponentTemplates = {
  item({ cssClasses, attribute, label, isRefined }) {
    return (
      <label className={cssClasses.label}>
        <input
          type="radio"
          className={cssClasses.radio}
          name={attribute}
          defaultChecked={isRefined}
        />
        <span className={cssClasses.labelText}>{label}</span>
      </label>
    );
  },
};

export default defaultTemplates;
