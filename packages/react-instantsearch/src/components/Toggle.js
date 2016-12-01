import React, {PropTypes, Component} from 'react';
import classNames from './classNames.js';

const cx = classNames('Toggle');

class Toggle extends Component {
  static propTypes = {
    currentRefinement: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.checked);
  };

  render() {
    const {currentRefinement, label} = this.props;

    return (
      <label {...cx('root')}>
        <input
          {...cx('checkbox')}
          type="checkbox"
          checked={currentRefinement}
          onChange={this.onChange}
        />
        <span {...cx('label')}>
          {label}
        </span>
      </label>
    );
  }
}

export default Toggle;
