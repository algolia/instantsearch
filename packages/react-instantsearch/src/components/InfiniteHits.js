import PropTypes from 'prop-types';
import React, { Component } from 'react';

import classNames from './classNames.js';
import translatable from '../core/translatable';

const cx = classNames('InfiniteHits');

class InfiniteHits extends Component {
  render() {
    const {
      hitComponent: ItemComponent,
      hits,
      hasMore,
      refine,
      translate,
    } = this.props;
    const renderedHits = hits.map(hit => (
      <ItemComponent key={hit.objectID} hit={hit} />
    ));
    const loadMoreButton = hasMore ? (
      <button {...cx('loadMore')} onClick={() => refine()}>
        {translate('loadMore')}
      </button>
    ) : (
      <button {...cx('loadMore')} disabled>
        {translate('loadMore')}
      </button>
    );

    return (
      <div {...cx('root')}>
        {renderedHits}
        {loadMoreButton}
      </div>
    );
  }
}

InfiniteHits.propTypes = {
  hits: PropTypes.array,
  hitComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
    .isRequired,
  hasMore: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

/* eslint-disable react/display-name */
InfiniteHits.defaultProps = {
  hitComponent: hit => (
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
      }}
    >
      {JSON.stringify(hit).slice(0, 100)}...
    </div>
  ),
};
/* eslint-enable react/display-name */

export default translatable({
  loadMore: 'Load more',
})(InfiniteHits);
