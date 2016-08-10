import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

import Select from './Select';

class HitsPerPageSelect extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    hitsPerPage: PropTypes.number.isRequired,
    refine: PropTypes.func.isRequired,
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      })),
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired,
  };

  render() {
    const {applyTheme, refine, hitsPerPage, items} = this.props;

    return (
      <Select
        {...applyTheme('root')}
        onChange={refine}
        selectedItem={hitsPerPage}
        items={items.map(item => ({
          value: typeof item === 'number' ? item : item.value,
          label: typeof item === 'number' ? item : item.label,
        }))}
      />
    );
  }
}

export default themeable({
  root: 'HitsPerPageSelect',
})(HitsPerPageSelect);
