import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

const cx = createClassNames('CurrentRefinements');

export const CurrentRefinements = ({
  items,
  canRefine,
  refine,
  translate,
  className,
}) => (
  <div className={classNames(cx('', !canRefine && '-noRefinement'), className)}>
    <ul className={cx('list', !canRefine && 'list--noRefinement')}>
      {items.map((item) => (
        <li key={item.label} className={cx('item')}>
          <span className={cx('label')}>{item.label}</span>
          {item.items ? (
            item.items.map((nest) => (
              <span key={nest.label} className={cx('category')}>
                <span className={cx('categoryLabel')}>{nest.label}</span>
                <button
                  className={cx('delete')}
                  onClick={() => refine(nest.value)}
                >
                  {translate('clearFilter', nest)}
                </button>
              </span>
            ))
          ) : (
            <span className={cx('category')}>
              <button
                className={cx('delete')}
                onClick={() => refine(item.value)}
              >
                {translate('clearFilter', item)}
              </button>
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const itemPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.func.isRequired,
    items: (...args) => itemPropTypes(...args),
  })
);

CurrentRefinements.propTypes = {
  items: itemPropTypes.isRequired,
  canRefine: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  className: PropTypes.string,
};

CurrentRefinements.defaultProps = {
  className: '',
};

export default translatable({
  clearFilter: '✕',
})(CurrentRefinements);
