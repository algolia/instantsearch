import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {itemPropType} from '../propTypes';

import {isSpecialClick} from './utils';

export default class MenuLink extends Component {
  static propTypes = {
    theme: PropTypes.object,
    item: itemPropType.isRequired,
    href: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  onClick = e => {
    if (isSpecialClick(e)) {
      return;
    }
    this.props.onClick(this.props.item);
    e.preventDefault();
  };

  render() {
    const {item, href, theme} = this.props;
    const th = themeable(theme);

    return (
      <a
        href={href}
        onClick={this.onClick}
        {...th('root', 'root')}
      >
        <span {...th('value', 'value')}>{item.label || item.value}</span>
        <span {...th('count', 'count')}>{item.count}</span>
      </a>
    );
  }
}
