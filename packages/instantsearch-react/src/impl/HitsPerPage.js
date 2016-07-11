import React, {PropTypes, Component} from 'react';

import config from '../config';
import createHitsPerPage from '../createHitsPerPage';

class HitsPerPage extends Component {
  static propTypes = {
    hitsPerPage: PropTypes.number,
    refine: PropTypes.func.isRequired,

    defaultValue: PropTypes.number,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    })).isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.value);
  };

  render() {
    const {hitsPerPage, options} = this.props;
    if (typeof hitsPerPage === 'undefined') {
      return null;
    }

    return (
      <select value={hitsPerPage} onChange={this.onChange}>
        {options.map(option =>
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        )}
      </select>
    );
  }
}

export default config(props => ({
  defaultHitsPerPage: props.defaultValue,
}))(createHitsPerPage(HitsPerPage));
