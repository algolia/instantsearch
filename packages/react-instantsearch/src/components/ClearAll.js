import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import theme from './ClearAll.css';

class ClearAll extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {applyTheme, translate, items, refine} = this.props;
    const isDisabled = items.length === 0;

    if (isDisabled) {
      return (
        <button {...applyTheme('root', 'root', 'clearAllDisabled')} disabled>
          {translate('reset')}
        </button>
      );
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

export default themeable(theme)(
  translatable({
    reset: 'ClearAll everything',
  })(ClearAll)
);
