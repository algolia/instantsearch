import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import theme from './Toggle.css';

class Toggle extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    currentRefinement: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.checked);
  };

  render() {
    const {applyTheme, currentRefinement, label} = this.props;

    return (
      <label {...applyTheme('root', 'root')}>
        <input
          {...applyTheme('checkbox', 'checkbox')}
          type="checkbox"
          checked={currentRefinement}
          onChange={this.onChange}
        />
        <span {...applyTheme('label', 'label')}>
          {label}
        </span>
      </label>
    );
  }
}

export default themeable(theme)(Toggle);
