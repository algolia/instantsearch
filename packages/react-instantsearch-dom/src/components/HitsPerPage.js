import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { createClassNames } from '../core/utils';

import Select from './Select';

const cx = createClassNames('HitsPerPage');

class HitsPerPage extends Component {
  static propTypes = {
    id: PropTypes.string,
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
    const { id, items, currentRefinement, refine, className } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        <Select
          id={id}
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
