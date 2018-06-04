import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import translatable from '../core/translatable';
import createClassNames from '../core/createClassNames';

const cx = createClassNames('InfiniteHits');

class InfiniteHits extends Component {
  render() {
    const {
      hitComponent: HitComponent,
      hits,
      hasMore,
      refine,
      translate,
      className,
    } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        <ul className={cx('list')}>
          {hits.map(hit => (
            <li key={hit.objectID} className={cx('item')}>
              <HitComponent hit={hit} />
            </li>
          ))}
        </ul>
        <button
          className={cx('loadMore', !hasMore && 'loadMore--disabled')}
          onClick={() => refine()}
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
  hasMore: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  className: PropTypes.string,
  hitComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};

InfiniteHits.defaultProps = {
  className: '',
  hitComponent: hit => (
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
        wordBreak: 'break-all',
      }}
    >
      {JSON.stringify(hit).slice(0, 100)}...
    </div>
  ),
};

export default translatable({
  loadMore: 'Load more',
})(InfiniteHits);
