/** @jsx h */
import { h } from 'preact';

import { formatNumber } from '../../lib/formatNumber';
import { cx } from '../../lib/utils';
import type { HierarchicalMenuComponentTemplates } from './hierarchical-menu';

const defaultTemplates: HierarchicalMenuComponentTemplates = {
  item({ url, label, count, cssClasses, isRefined }) {
    const linkCssClasses = ([] as Array<string | undefined>)
      .concat(cssClasses.link, isRefined ? cssClasses.selectedItemLink : [])
      .filter(Boolean) as string[];

    return (
      <a className={cx(linkCssClasses)} href={url}>
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
