import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import createClassNames from './createClassNames';
import Select from './Select';

const cx = createClassNames('HitsPerPage');

class HitsPerPage extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.string,
      })
    ).isRequired,
    currentRefinement: PropTypes.number.isRequired,
    refine: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  render() {
    const { items, currentRefinement, refine, className } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        <Select
          onSelect={refine}
          selectedItem={currentRefinement}
          items={items}
          cx={cx}
        />
      </div>
    );
  }
}

export default HitsPerPage;
