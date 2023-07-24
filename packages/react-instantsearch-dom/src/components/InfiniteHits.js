import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

const cx = createClassNames('InfiniteHits');

class InfiniteHits extends Component {
  render() {
    const {
      hitComponent: HitComponent,
      hits,
      showPrevious,
      hasPrevious,
      hasMore,
      refinePrevious,
      refineNext,
      translate,
      className,
    } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        {showPrevious && (
          <button
            className={cx(
              'loadPrevious',
              !hasPrevious && 'loadPrevious--disabled'
            )}
            onClick={() => refinePrevious()}
            disabled={!hasPrevious}
          >
            {translate('loadPrevious')}
          </button>
        )}
        <ul className={cx('list')}>
          {hits.map((hit) => (
            <li key={hit.objectID} className={cx('item')}>
              <HitComponent hit={hit} />
            </li>
          ))}
        </ul>
        <button
          className={cx('loadMore', !hasMore && 'loadMore--disabled')}
          onClick={() => refineNext()}
          disabled={!hasMore}
        >
          {translate('loadMore')}
        </button>
      </div>
    );
  }
}

InfiniteHits.propTypes = {
  hits: PropTypes.arrayOf(PropTypes.object).isRequired,
  showPrevious: PropTypes.bool.isRequired,
  hasPrevious: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired,
  refinePrevious: PropTypes.func.isRequired,
  refineNext: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  className: PropTypes.string,

  // this is actually PropTypes.elementType, but our prop-types version is outdated
  hitComponent: PropTypes.any,
};

InfiniteHits.defaultProps = {
  className: '',
  showPrevious: false,
  hitComponent: (hit) => (
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
        wordBreak: 'break-all',
      }}
    >
      {JSON.stringify(hit).slice(0, 100)}
      ...
    </div>
  ),
};

export default translatable({
  loadPrevious: 'Load previous',
  loadMore: 'Load more',
})(InfiniteHits);
