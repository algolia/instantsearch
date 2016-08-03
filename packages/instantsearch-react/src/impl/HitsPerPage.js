import React, {PropTypes, Component} from 'react';

import translatable from '../translatable';

class HitsPerPage extends Component {
  static propTypes = {
    hitsPerPage: PropTypes.number,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    values: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.value);
  };

  render() {
    const {translate, hitsPerPage, values} = this.props;

    return (
      <label>
        {translate('label')}
        <select value={hitsPerPage} onChange={this.onChange}>
          {values.map(v =>
            <option key={v} value={v}>
              {translate('value', v)}
            </option>
          )}
        </select>
      </label>
    );
  }
}

export default translatable({
  label: 'Hits per page',
  value: v => v.toString(),
})(HitsPerPage);
