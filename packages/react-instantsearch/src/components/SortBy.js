import React, {PropTypes, Component} from 'react';
import Select from './Select';
import classNames from './classNames.js';

const cx = classNames('SortBy');

class SortBy extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,

    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,

    currentRefinement: PropTypes.string.isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.value);
  }

  render() {
    const {refine, items, currentRefinement} = this.props;
    return (
      <Select
        cx={cx}
        selectedItem={currentRefinement}
        onSelect={refine}
        items={items}
      />
    );
  }
}

export default SortBy;
