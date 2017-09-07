import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Template from './Template';
import autoHideContainerHOC from '../decorators/autoHideContainer.js';
import headerFooterHOC from '../decorators/headerFooter.js';

class MenuSelect extends Component {
  static propTypes = {
    cssClasses: PropTypes.shape({
      select: PropTypes.string,
      option: PropTypes.string,
    }),
    items: PropTypes.array.isRequired,
    refine: PropTypes.func.isRequired,
    templateProps: PropTypes.object.isRequired,
  };

  get selectValue() {
    const selectValue = this.props.items.find(({ isRefined }) => isRefined);
    return selectValue || { value: 'all' };
  }

  handleSelectChange = ({ target: { value } }) => {
    this.props.refine(value === 'all' ? this.selectValue.value : value);
  };

  render() {
    const { cssClasses, templateProps, items } = this.props;

    return (
      <select
        className={cssClasses.select}
        value={this.selectValue.value}
        onChange={this.handleSelectChange}
      >
        <option value="all" className={cssClasses.option}>
          <Template templateKey="seeAllOption" {...templateProps} />
        </option>

        {items.map(item =>
          <option
            key={item.value}
            value={item.value}
            className={cssClasses.option}
          >
            <Template data={item} templateKey="item" {...templateProps} />
          </option>
        )}
      </select>
    );
  }
}

export default autoHideContainerHOC(headerFooterHOC(MenuSelect));
