import React, {PropTypes, Component} from 'react';

import config from '../config';
import createHits from '../createHits';

import DefaultHitComponent from './DefaultHitComponent';

class Hits extends Component {
  static propTypes = {
    itemComponent: PropTypes.func,
    hits: PropTypes.array,
  };

  static defaultProps = {
    itemComponent: DefaultHitComponent,
  };

  render() {
    const {itemComponent: ItemComponent, hits} = this.props;

    return (
      <div>
        {hits && hits.map(hit =>
          <ItemComponent key={hit.objectID} hit={hit} />
        )}
      </div>
    );
  }
}

export default config(props => ({
  hitsPerPage: props.hitsPerPage,
}))(createHits(Hits));
