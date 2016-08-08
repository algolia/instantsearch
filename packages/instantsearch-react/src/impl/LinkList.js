import React, {PropTypes, Component} from 'react';

import LinkItem from './LinkItem';

export default class LinkList extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    onItemClick: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      href: PropTypes.string.isRequired,
    })).isRequired,
    selectedItem: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  };

  onItemClick = value => {
    this.props.onItemClick(value);
  }

  render() {
    const {applyTheme, items, selectedItem} = this.props;

    return (
      <div {...applyTheme('root', 'root')}>
        {items.map(item =>
          <LinkItem
            {...applyTheme(
              item.value,
              'item',
              item.value === selectedItem && 'itemSelected'
            )}
            href={item.href}
            onClick={this.onItemClick.bind(null, item.value)}
          >
            {item.label}
          </LinkItem>
        )}
      </div>
    );
  }
}
