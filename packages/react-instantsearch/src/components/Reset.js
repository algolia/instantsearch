import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

class Reset extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {applyTheme, translate, items, refine} = this.props;
    if (items.length === 0) {
      return null;
    }

    return (
      <button
        {...applyTheme('root', 'root')}
        onClick={refine.bind(null, items)}
      >
        {translate('reset')}
      </button>
    );
  }
}

export default themeable({
  root: 'Reset',
})(
  translatable({
    reset: 'Reset everything',
  })(Reset)
);
