import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import theme from './Toggle.css';

class Toggle extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.checked);
  };

  render() {
    const {applyTheme, checked, label} = this.props;

    return (
      <label {...applyTheme('root')}>
        <input
          {...applyTheme('checkbox')}
          type="checkbox"
          checked={checked}
          onChange={this.onChange}
        />
        <span {...applyTheme('label')}>
          {label}
        </span>
      </label>
    );
  }
}

export default themeable(theme)(Toggle);
