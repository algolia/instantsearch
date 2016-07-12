import React, {PropTypes, Component} from 'react';

import config from '../config';
import createHitsPerPage from '../createHitsPerPage';

import {getTranslation} from './utils';

class HitsPerPage extends Component {
  static propTypes = {
    // Provided by `createHitsPerPage`
    hitsPerPage: PropTypes.number,
    refine: PropTypes.func.isRequired,

    translations: PropTypes.object,
    defaultValue: PropTypes.number,
    values: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  static defaultProps = {
    translations: {
      label: 'Hits per page',
      value: v => v.toString(),
    },
  };

  onChange = e => {
    this.props.refine(e.target.value);
  };

  render() {
    const {translations, hitsPerPage, values} = this.props;
    if (typeof hitsPerPage === 'undefined') {
      return null;
    }

    return (
      <label>
        {getTranslation(translations.label)}
        <select value={hitsPerPage} onChange={this.onChange}>
          {values.map(v =>
            <option
              key={v}
              value={v}
            >
              {getTranslation(translations.value, v)}
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
