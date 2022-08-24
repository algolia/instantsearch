/** @jsx h */
import { h } from 'preact';

import type { RefinementListComponentTemplates } from './refinement-list';
import { formatNumber } from '../../lib/formatNumber';
import { cx } from '../../lib/utils';

const defaultTemplates: RefinementListComponentTemplates = {
  item({ cssClasses, count, value, highlighted, isRefined, isFromSearch }) {
    return (
      <label className={cx(cssClasses.label)}>
        <input
          type="checkbox"
          className={cx(cssClasses.checkbox)}
          value={value}
          defaultChecked={isRefined}
        />
        <span
          className={cx(cssClasses.labelText)}
          dangerouslySetInnerHTML={
            isFromSearch ? { __html: highlighted } : undefined
          }
        >
          {!isFromSearch && highlighted}
        </span>
        <span className={cx(cssClasses.count)}>
          {formatNumber(String(count))}
        </span>
      </label>
    );
  },
  showMoreText({ isShowingMore }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
  searchableNoResults() {
    return 'No results';
  },
};

export default defaultTemplates;
