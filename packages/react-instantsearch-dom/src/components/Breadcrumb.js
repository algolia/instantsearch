import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

import Link from './Link';

const cx = createClassNames('Breadcrumb');

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })
);

class Breadcrumb extends Component {
  static propTypes = {
    canRefine: PropTypes.bool.isRequired,
    createURL: PropTypes.func.isRequired,
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    rootURL: PropTypes.string,
    separator: PropTypes.node,
    translate: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    rootURL: null,
    separator: ' > ',
    className: '',
  };

  render() {
    const {
      canRefine,
      createURL,
      items,
      refine,
      rootURL,
      separator,
      translate,
      className,
    } = this.props;
    const rootPath = canRefine ? (
      <li className={cx('item')}>
        <Link
          className={cx('link')}
          onClick={() => (!rootURL ? refine() : null)}
          href={rootURL ? rootURL : createURL()}
        >
          {translate('rootLabel')}
        </Link>
      </li>
    ) : null;

    const breadcrumb = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <li className={cx('item', isLast && 'item--selected')} key={idx}>
          <span className={cx('separator')}>{separator}</span>
          {!isLast ? (
            <Link
              className={cx('link')}
              onClick={() => refine(item.value)}
              href={createURL(item.value)}
            >
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </li>
      );
    });

    return (
      <div
        className={classNames(cx('', !canRefine && '-noRefinement'), className)}
      >
        <ul className={cx('list')}>
          {rootPath}
          {breadcrumb}
        </ul>
      </div>
    );
  }
}

export default translatable({
  rootLabel: 'Home',
})(Breadcrumb);
