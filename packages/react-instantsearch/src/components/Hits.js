import React, {PropTypes, Component} from 'react';
import classNames from './classNames.js';

const cx = classNames('Hits');

class Hits extends Component {
  render() {
    const {itemComponent: ItemComponent, hits} = this.props;
    return (
      <div {...cx('root')}>
        {hits.map(hit =>
          <ItemComponent key={hit.objectID} hit={hit} />
        )}
      </div>
    );
  }
}

Hits.propTypes = {
  hits: PropTypes.array,

  itemComponent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]).isRequired,
};

Hits.defaultProps = {
  itemComponent: hit =>
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
      }}
    >{JSON.stringify(hit).slice(0, 100)}...</div>,
};

export default Hits;
