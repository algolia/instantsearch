import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { createClassNames } from '../core/utils';

const cx = createClassNames('RelevantSort');

export type RelevantSortComponentProps = {
  isRelevantSorted: boolean;
};

export type RelevantSortProps = {
  className?: string;
  isVirtualReplica: boolean;
  isRelevantSorted: boolean;
  buttonTextComponent?: React.FunctionComponent<RelevantSortComponentProps>;
  textComponent?: React.FunctionComponent<RelevantSortComponentProps>;
  refine: (relevancyStrictness: number | undefined) => void;
};

const DefaultButtonTextComponent = ({
  isRelevantSorted,
}: RelevantSortComponentProps) => (
  <span>{isRelevantSorted ? 'See all results' : 'See relevant results'}</span>
);

const RelevantSort: React.FC<RelevantSortProps> = ({
  className = '',
  isVirtualReplica,
  isRelevantSorted,
  buttonTextComponent: ButtonTextComponent = DefaultButtonTextComponent,
  textComponent: TextComponent,
  refine,
}) =>
  !isVirtualReplica ? null : (
    <div className={classNames(cx(''), className)}>
      <div className={cx('text')}>
        {TextComponent && <TextComponent isRelevantSorted={isRelevantSorted} />}
      </div>
      <button
        className={cx('button')}
        onClick={() => refine(isRelevantSorted ? 0 : undefined)}
      >
        <ButtonTextComponent isRelevantSorted={isRelevantSorted} />
      </button>
    </div>
  );

RelevantSort.propTypes = {
  buttonTextComponent: PropTypes.func,
  className: PropTypes.string,
  isVirtualReplica: PropTypes.bool.isRequired,
  isRelevantSorted: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
  textComponent: PropTypes.func,
};

export default RelevantSort;
