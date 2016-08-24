import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

import LinkList from './LinkList';

const ThemedLinkList = themeable({
  root: 'HitsPerPage',
  item: 'HitsPerPage__item',
  itemLink: 'HitsPerPage__item__link',
  itemSelected: 'HitsPerPage__item--selected',
})(LinkList);

export default class HitsPerPage extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,

    hitsPerPage: PropTypes.number.isRequired,
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired,

    listComponent: PropTypes.func,
  };

  static defaultProps = {
    listComponent: ThemedLinkList,
  };

  render() {
    const {
      hitsPerPage,
      items,
      listComponent: ListComponent,
      refine,
      ...otherProps,
    } = this.props;

    return (
      <ListComponent
        {...otherProps}
        onSelect={refine}
        selectedItem={hitsPerPage}
        items={items.map(item =>
          typeof item === 'number' ?
            {value: item, label: item.toString()} :
            item
        )}
      />
    );
  }
}
