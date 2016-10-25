import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import Select from './Select';
import theme from './HitsPerPage.css';

class HitsPerPage extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    currentRefinement: PropTypes.number.isRequired,

    /**
     * List of hits per page options.
     * Passing a list of numbers `[n]` is a shorthand for `[{value: n, label: n}]`.
     * Beware: Contrary to `HitsPerPage`, the `label` of `HitsPerPage` items must be either a string or a number.
     * @public
     * @defines HitsPerPageSelectItem
     */
    items: PropTypes.arrayOf(
      PropTypes.shape({
        /**
         * Number of hits to display.
         */
        value: PropTypes.number.isRequired,

        /**
         * Label to display on the option.
         */
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  };

  render() {
    const {
      currentRefinement,
      refine,
      items,
      applyTheme,
    } = this.props;

    return (
      <Select
        onSelect={refine}
        selectedItem={currentRefinement}
        items={items}
        applyTheme={applyTheme}
      />
    );
  }
}

export default themeable(theme)(HitsPerPage);
