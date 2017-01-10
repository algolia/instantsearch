import React, {PropTypes, Component} from 'react';
import Select from './Select';
import classNames from './classNames.js';

const cx = classNames('HitsPerPage');

class HitsPerPage extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    currentRefinement: PropTypes.number.isRequired,
    transformItems: PropTypes.func,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        /**
         * Number of hits to display.
         */
        value: PropTypes.number.isRequired,

        /**
         * Label to display on the option.
         */
        label: PropTypes.string,
      })
    ),
  };

  render() {
    const {
      currentRefinement,
      refine,
      items,
    } = this.props;
    return (
      <Select
        onSelect={refine}
        selectedItem={currentRefinement}
        items={items}
        cx={cx}
      />
    );
  }
}

export default HitsPerPage;
