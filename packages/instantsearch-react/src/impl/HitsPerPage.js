import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

import LinkList from './LinkList';

class HitsPerPage extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    hitsPerPage: PropTypes.number.isRequired,
    createURL: PropTypes.func.isRequired,
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
    const {applyTheme, createURL, refine, hitsPerPage, items} = this.props;

    return (
      <LinkList
        applyTheme={applyTheme}
        onSelect={refine}
        selectedItem={hitsPerPage}
        createURL={createURL}
        items={items.map(item =>
          typeof item === 'number' ?
            {
              value: item,
              label: item,
            } :
            {
              value: item.value,
              label: item.label,
            }
        )}
      />
    );
  }
}

export default themeable({
  root: 'HitsPerPage',
  item: 'HitsPerPage__item',
  itemSelected: 'HitsPerPage__item--selected',
})(HitsPerPage);
