/** @jsx h */
import { h } from 'preact';

import { formatNumber } from '../../lib/formatNumber';
import { cx } from '../../lib/utils';

import type { MenuComponentTemplates } from './menu';

const defaultTemplates: MenuComponentTemplates = {
  item({
    cssClasses,
    url,
    count,
    highlighted,
    label,
    isFromSearch,
    searchable,
  }) {
    return (
      <a className={cx(cssClasses.link)} href={url}>
        {searchable ? (
          <span
            className={cx(cssClasses.label)}
            dangerouslySetInnerHTML={
              isFromSearch ? { __html: highlighted } : undefined
            }
          >
            {!isFromSearch && highlighted}
          </span>
        ) : (
          <span className={cx(cssClasses.label)}>{label}</span>
        )}

        <span className={cx(cssClasses.count)}>{formatNumber(count)}</span>
      </a>
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
