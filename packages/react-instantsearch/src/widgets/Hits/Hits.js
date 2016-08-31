import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

class Hits extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    hits: PropTypes.array,

    /**
     * Component to render each hit with.
     * The component will called with a `hit` prop.
     * @public
     */
    itemComponent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
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
