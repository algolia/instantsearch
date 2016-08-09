import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

class DefaultHitComponent extends Component {
  static propTypes = {
    hit: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div>
        {Object.keys(this.props.hit).map(key =>
          <div key={key}>
            <strong>{key}:</strong>
            {' '}
            {JSON.stringify(this.props.hit[key])}
          </div>
        )}
      </div>
    );
  }
}

class Hits extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    hits: PropTypes.array,
    itemComponent: PropTypes.func,
  };

  static defaultProps = {
    itemComponent: DefaultHitComponent,
  };

  render() {
    const {applyTheme, itemComponent: ItemComponent, hits} = this.props;
    return (
      <div {...applyTheme('root', 'root')}>
        {hits.map(hit =>
          <ItemComponent key={hit.objectID} hit={hit} />
        )}
      </div>
    );
  }
}

export default themeable({
  root: 'Hits',
})(Hits);
