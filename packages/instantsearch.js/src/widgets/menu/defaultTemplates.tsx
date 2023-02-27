/** @jsx h */
import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { formatNumber } from '../../lib/formatNumber';

import type { MenuComponentTemplates } from './menu';

const defaultTemplates: MenuComponentTemplates = {
  item({ cssClasses, url, label, count }) {
    return (
      <a className={cx(cssClasses.link)} href={url}>
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
