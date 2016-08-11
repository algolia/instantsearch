import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

import LinkList from './LinkList';

const ThemedLinkList = themeable({
  root: 'HitsPerPage',
  item: 'HitsPerPage__item',
  itemSelected: 'HitsPerPage__item--selected',
})(LinkList);

export default class HitsPerPage extends Component {
  static propTypes = {
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
      ...otherProps,
    } = this.props;

    return (
      <ListComponent
        {...otherProps}
        selectedItem={hitsPerPage}
        items={items.map(item =>
          typeof item === 'number' ? {value: item, label: item} : item
        )}
      />
    );
  }
}
