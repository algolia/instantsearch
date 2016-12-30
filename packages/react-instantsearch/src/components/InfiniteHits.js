import React, {PropTypes, Component} from 'react';
import classNames from './classNames.js';

const cx = classNames('InfiniteHits');

class InfiniteHits extends Component {
  render() {
    const {hitComponent: ItemComponent, hits, hasMore, refine} = this.props;
    const renderedHits = hits.map(hit =>
      <ItemComponent key={hit.objectID} hit={hit} />
    );
    const loadMoreButton = hasMore ?
      <button {...cx('reset')} onClick={() => refine()}>Load more</button> :
      <button {...cx('reset')} disabled>Load more</button>;

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
  hitComponent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]).isRequired,
  hasMore: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
};

InfiniteHits.defaultProps = {
  hitComponent: hit =>
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
      }}
    >{JSON.stringify(hit).slice(0, 100)}...</div>,
};

export default InfiniteHits;
