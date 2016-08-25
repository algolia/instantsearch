import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

import Select from '../../components/Select';

class HitsPerPageSelect extends Component {
  static propTypes = {
    ...(__DOC__ ? Select.propTypes : {}),
    refine: PropTypes.func.isRequired,
    hitsPerPage: PropTypes.number.isRequired,
  };

  render() {
    const {
      hitsPerPage,
      refine,
      ...otherProps,
    } = this.props;

    return (
      <Select
        {...otherProps}
        onSelect={refine}
        selectedItem={hitsPerPage}
      />
    );
  }
}

export default themeable({
  root: 'HitsPerPageSelect',
})(HitsPerPageSelect);
