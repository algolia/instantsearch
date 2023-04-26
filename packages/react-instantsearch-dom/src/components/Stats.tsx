import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translatable } from 'react-instantsearch-core';
import { createClassNames } from '../core/utils';

const cx = createClassNames('Stats');

export type StatsProps = {
  className?: string;
  areHitsSorted: boolean;
  nbHits: number;
  nbSortedHits?: number;
  processingTimeMS: number;
  translate: (
    key: string,
    n: number,
    ms: number,
    nSorted?: number,
    areHitsSorted?: boolean
  ) => string;
};

const Stats: React.FC<StatsProps> = ({
  className = '',
  areHitsSorted,
  nbHits,
  nbSortedHits,
  processingTimeMS,
  translate,
}) => {
  return (
    <div className={classNames(cx(''), className)}>
      <span className={cx('text')}>
        {translate(
          'stats',
          nbHits,
          processingTimeMS,
          nbSortedHits,
          areHitsSorted
        )}
      </span>
    </div>
  );
};

Stats.propTypes = {
  className: PropTypes.string,
  areHitsSorted: PropTypes.bool.isRequired,
  nbHits: PropTypes.number.isRequired,
  nbSortedHits: PropTypes.number,
  processingTimeMS: PropTypes.number.isRequired,
  translate: PropTypes.func.isRequired,
};

export default translatable({
  stats: (
    n: number,
    ms: number,
    nSorted?: number,
    areHitsSorted?: boolean
  ): string =>
    areHitsSorted && n !== nSorted
      ? `${nSorted!.toLocaleString()} relevant results sorted out of ${n.toLocaleString()} found in ${ms.toLocaleString()}ms`
      : `${n.toLocaleString()} results found in ${ms.toLocaleString()}ms`,
})(Stats);
