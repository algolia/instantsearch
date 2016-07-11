import React, {PropTypes, Component} from 'react';

import config from '../config';
import createHits from '../createHits';

import DefaultHitComponent from './DefaultHitComponent';

// @TODO: Figure out if this component needs a `theme` prop or if we can just
// transfer props directly onto the container div.
class Hits extends Component {
  static propTypes = {
    // Provided by `createHits`
    hits: PropTypes.array,

    itemComponent: PropTypes.func,
  };

  static defaultProps = {
    itemComponent: DefaultHitComponent,
  };

  render() {
    const {itemComponent: ItemComponent, hits} = this.props;

    if (!hits) {
      return null;
    }

    return (
      <div>
        {hits.map(hit =>
          <ItemComponent key={hit.objectID} hit={hit} />
        )}
      </div>
    );
  }
}

export default config(props => ({
  hitsPerPage: props.hitsPerPage,
}))(createHits(Hits));
