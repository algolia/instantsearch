/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import { StatsCSSClasses, StatsTemplates } from '../../widgets/stats/stats';
import Template from '../Template/Template';

type StatsProps = {
  cssClasses: StatsCSSClasses;
  templateProps: {
    [key: string]: any;
    templates: StatsTemplates;
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
