import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { createClassNames } from '../core/utils';

type CustomUserData = {
  [key: string]: any;
};

const cx = createClassNames('QueryRuleCustomData');

type QueryRuleCustomDataRenderProps<TItem> = {
  items: TItem[];
};

export type QueryRuleCustomDataProps<TItem> = {
  items: TItem[];
  className?: string;
  children: (options: QueryRuleCustomDataRenderProps<TItem>) => React.ReactNode;
};

const QueryRuleCustomData: React.FC<
  QueryRuleCustomDataProps<CustomUserData>
> = ({ items, className, children }) => (
  <div className={classNames(cx(''), className)}>{children({ items })}</div>
);

QueryRuleCustomData.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired as any,
  className: PropTypes.string,
  children: PropTypes.func.isRequired,
};

export default QueryRuleCustomData;
