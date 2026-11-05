/** @jsx h */
import { getHighlightedParts } from 'instantsearch-core';
import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import { Highlight } from '../../components/Highlight/Highlight';
import { formatNumber } from '../../lib/formatNumber';

import type { RefinementListComponentTemplates } from './refinement-list';

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
        <span className={cx(cssClasses.labelText)}>
          {isFromSearch ? (
            <Highlight parts={[getHighlightedParts(highlighted)]} />
          ) : (
            highlighted
          )}
        </span>
        <span className={cx(cssClasses.count)}>{formatNumber(count)}</span>
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
