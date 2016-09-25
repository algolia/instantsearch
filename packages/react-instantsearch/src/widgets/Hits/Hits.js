import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import theme from './Hits.css';

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
    ]).isRequired,
  };

  static defaultProps = {
    itemComponent: hit =>
      <div
        style={{
          borderBottom: '1px solid #bbb',
          paddingBottom: '5px',
          marginBottom: '5px',
        }}
      >{JSON.stringify(hit).slice(0, 100)}...</div>,
  }

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

export default themeable(theme)(Hits);
