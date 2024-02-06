/** @jsx h */
import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import { formatNumber } from '../../lib/formatNumber';

import type { HierarchicalMenuComponentTemplates } from './hierarchical-menu';

const defaultTemplates: HierarchicalMenuComponentTemplates = {
  item({ url, label, count, cssClasses, isRefined }) {
    return (
      <a
        className={cx(
          cx(cssClasses.link),
          cx(isRefined ? cssClasses.selectedItemLink : undefined)
        )}
        href={url}
      >
        <span className={cx(cssClasses.label)}>{label}</span>
        <span className={cx(cssClasses.count)}>{formatNumber(count)}</span>
      </a>
    );
  },
  showMoreText({ isShowingMore }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
};

export default defaultTemplates;
