import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createClassNames } from '../core/utils';

const cx = createClassNames('SmartSort');

export type SmartSortComponentProps = {
  isSmartSorted: boolean;
};

export type SmartSortProps = {
  className?: string;
  isVirtualReplica: boolean;
  isSmartSorted: boolean;
  buttonTextComponent: React.FunctionComponent<SmartSortComponentProps>;
  textComponent: React.FunctionComponent<SmartSortComponentProps>;
  refine(relevancyStrictness: number | undefined): void;
};

const SmartSort: React.FC<SmartSortProps> = ({
  className = '',
  isVirtualReplica,
  isSmartSorted,
  buttonTextComponent: ButtonTextComponent,
  textComponent: TextComponent,
  refine,
}) =>
  !isVirtualReplica ? null : (
    <div className={classNames(cx(''), className)}>
      <div className={cx('text')}>
        <TextComponent isSmartSorted={isSmartSorted} />
      </div>
      <button
        className={cx('button')}
        onClick={() => refine(isSmartSorted ? 0 : undefined)}
      >
        <ButtonTextComponent isSmartSorted={isSmartSorted} />
      </button>
    </div>
  );

SmartSort.propTypes = {
  buttonTextComponent: PropTypes.func.isRequired,
  className: PropTypes.string,
  isVirtualReplica: PropTypes.bool.isRequired,
  isSmartSorted: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
  textComponent: PropTypes.func.isRequired,
};

export default SmartSort;
