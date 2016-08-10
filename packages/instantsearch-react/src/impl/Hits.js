import React, {PropTypes, Component} from 'react';

import DefaultHitComponent from './DefaultHitComponent';

// @TODO: Figure out if this component needs a `theme` prop or if we can just
// transfer props directly onto the container div.
export default class Hits extends Component {
  static propTypes = {
    hits: PropTypes.array,
    itemComponent: PropTypes.func,
  };

  static defaultProps = {
    itemComponent: DefaultHitComponent,
  };

  render() {
    const {itemComponent: ItemComponent, hits} = this.props;
    return (
      <div>
        {hits.map(hit =>
          <ItemComponent key={hit.objectID} hit={hit} />
        )}
      </div>
    );
  }
}
