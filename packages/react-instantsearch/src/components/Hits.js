import React, {PropTypes, Component} from 'react';
import classNames from './classNames.js';

const cx = classNames('Hits');

class Hits extends Component {
  render() {
    const {hitComponent: ItemComponent, hits} = this.props;
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

  hitComponent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]).isRequired,
};

Hits.defaultProps = {
  hitComponent: hit =>
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
      }}
    >{JSON.stringify(hit).slice(0, 100)}...</div>,
};

export default Hits;
