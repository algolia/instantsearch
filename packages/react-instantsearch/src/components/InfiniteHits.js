import React, {PropTypes, Component} from 'react';
import classNames from './classNames.js';

const cx = classNames('InfiniteHits');

class InfiniteHits extends Component {
  render() {
    const {itemComponent: ItemComponent, hits, hasMore, refine} = this.props;
    const renderedHits = hits.map(hit =>
      <ItemComponent key={hit.objectID} hit={hit} />
    );
    const loadMoreButton = hasMore ?
      <button onClick={() => refine()}>Load more</button> :
      <button disabled>Load more</button>;

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
  itemComponent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]).isRequired,
  hasMore: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
};

InfiniteHits.defaultProps = {
  itemComponent: hit =>
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
      }}
    >{JSON.stringify(hit).slice(0, 100)}...</div>,
};

export default InfiniteHits;
