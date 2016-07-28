import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {itemPropType} from '../propTypes';
import {getTranslation} from './utils';

export default class RefinementListCheckboxItem extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    translations: PropTypes.object.isRequired,
    item: itemPropType.isRequired,
    selected: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  onChange = e => {
    this.props.onChange(this.props.item, e.target.checked);
  };

  render() {
    const {item, selected, translations, theme} = this.props;

    const th = themeable(theme);

    return (
      <label {...th('root', 'root')}>
        <input
          {...th('checkbox', 'checkbox')}
          type="checkbox"
          checked={selected}
          onChange={this.onChange}
        />
        <span {...th('label', 'label')}>
          {item.value}
        </span>
        {' '}
        <span {...th('count', 'count')}>
          {getTranslation(
            'count',
            {},
            translations,
            item.count
          )}
        </span>
      </label>
    );
  }
}
