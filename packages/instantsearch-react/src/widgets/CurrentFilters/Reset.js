import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

class Reset extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    filters: PropTypes.arrayOf(PropTypes.object).isRequired,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {applyTheme, translate, filters, refine} = this.props;
    if (filters.length === 0) {
      return null;
    }

    return (
      <button
        {...applyTheme('root', 'root')}
        onClick={refine.bind(null, filters)}
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
