import React, {PropTypes, Component} from 'react';

import {getTranslation} from '../utils';

const defaultTranslations = {
  label: 'Hits per page',
  value: v => v.toString(),
};

export default class HitsPerPage extends Component {
  static propTypes = {
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
    const {translations, hitsPerPage, values, defaultValue} = this.props;

    return (
      <label>
        {getTranslation('label', defaultTranslations, translations)}
        <select value={hitsPerPage || defaultValue} onChange={this.onChange}>
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
