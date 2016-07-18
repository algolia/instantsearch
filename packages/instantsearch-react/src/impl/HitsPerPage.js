import React, {PropTypes, Component} from 'react';

import config from '../config';
import createHitsPerPage from '../createHitsPerPage';

import {getTranslation} from './utils';

const defaultTranslations = {
  label: 'Hits per page',
  value: v => v.toString(),
};

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
    translations: defaultTranslations,
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
        {getTranslation('label', defaultTranslations, translations)}
        <select value={hitsPerPage} onChange={this.onChange}>
          {values.map(v =>
            <option key={v} value={v}>
              {getTranslation('value', defaultTranslations, translations, v)}
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
