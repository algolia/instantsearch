import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import Select from './Select';

import theme from './MenuSelect.css';

class MenuSelect extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })).isRequired,
    currentRefinement: PropTypes.string.isRequired,
  };

  render() {
    const {applyTheme, refine, items, currentRefinement, translate} = this.props;

    return (
      <Select
        applyTheme={applyTheme}
        selectedItem={currentRefinement || ''}
        onSelect={refine}
        items={[
          {label: translate('none'), value: ''},
        ].concat(items.map(item => ({
          label: `${item.value} (${translate('count', item.count)})`,
          value: item.value,
        })))}
      />
    );
  }
}

export default themeable(theme)(
  translatable({
    none: 'None',
    count: count => count.toLocaleString(),
  })(
    MenuSelect
  )
);
