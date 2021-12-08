/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import type {
  StatsCSSClasses,
  StatsTemplates,
} from '../../widgets/stats/stats.js';
import Template from '../Template/Template.js';
import type { ComponentCSSClasses } from '../../types/index.js';

export type StatsComponentCSSClasses = ComponentCSSClasses<StatsCSSClasses>;

export type StatsComponentTemplates = Required<StatsTemplates>;

type StatsProps = {
  cssClasses: StatsComponentCSSClasses;
  templateProps: {
    [key: string]: any;
    templates: StatsComponentTemplates;
  };
  hitsPerPage: number | undefined;
  nbHits: number;
  nbSortedHits: number | undefined;
  areHitsSorted: boolean;
  nbPages: number;
  page: number;
  processingTimeMS: number;
  query: string;
};

const Stats = ({
  nbHits,
  nbSortedHits,
  cssClasses,
  templateProps,
  ...rest
}: StatsProps) => (
  <div className={cx(cssClasses.root)}>
    <Template
      {...templateProps}
      templateKey="text"
      rootTagName="span"
      rootProps={{ className: cssClasses.text }}
      data={{
        hasManySortedResults: nbSortedHits && nbSortedHits > 1,
        hasNoSortedResults: nbSortedHits === 0,
        hasOneSortedResults: nbSortedHits === 1,
        hasManyResults: nbHits > 1,
        hasNoResults: nbHits === 0,
        hasOneResult: nbHits === 1,
        nbHits,
        nbSortedHits,
        cssClasses,
        ...rest,
      }}
    />
  </div>
);

export default Stats;
