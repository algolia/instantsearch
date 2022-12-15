/* eslint-disable react/prop-types */
import React from 'react';
import { DynamicWidgets as CoreDynamicWidgets } from 'react-instantsearch-core';
import classNames from 'classnames';
import { createClassNames } from '../core/utils';

const cx = createClassNames('DynamicWidgets');

export default function DynamicWidgets({ children, className, ...props }) {
  return (
    <div className={classNames(cx(''), className)}>
      <CoreDynamicWidgets {...props}>{children}</CoreDynamicWidgets>
    </div>
  );
}
