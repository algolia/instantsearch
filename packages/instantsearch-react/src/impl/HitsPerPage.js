import React, {PropTypes, Component} from 'react';

import config from '../config';
import createHitsPerPage from '../createHitsPerPage';

import {getLabel} from './utils';

class HitsPerPage extends Component {
  static propTypes = {
    // Provided by `createHitsPerPage`
    hitsPerPage: PropTypes.number,
    refine: PropTypes.func.isRequired,

    labels: PropTypes.object,
    defaultValue: PropTypes.number,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    })).isRequired,
  };

  static defaultProps = {
    labels: {
      label: 'Hits per page',
    },
  };

  onChange = e => {
    this.props.refine(e.target.value);
  };

  render() {
    const {labels, hitsPerPage, options} = this.props;
    if (typeof hitsPerPage === 'undefined') {
      return null;
    }

    return (
      <label>
        {getLabel(labels.label)}
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
      </label>
    );
  }
}

export default config(props => ({
  defaultHitsPerPage: props.defaultValue,
}))(createHitsPerPage(HitsPerPage));
