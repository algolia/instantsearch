import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';

import Template from './Template';
import autoHideContainerHOC from '../decorators/autoHideContainer';
import headerFooterHOC from '../decorators/headerFooter';

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

  handleSelectChange = ({ target: { value } }) => {
    this.props.refine(value);
  };

  render() {
    const { cssClasses, templateProps, items } = this.props;
    const { value: selectedValue } = items.find(item => item.isRefined) || {
      value: '',
    };

    return (
      <select
        className={cssClasses.select}
        value={selectedValue}
        onChange={this.handleSelectChange}
      >
        <option value="" className={cssClasses.option}>
          <Template templateKey="seeAllOption" {...templateProps} />
        </option>

        {items.map(item => (
          <option
            key={item.value}
            value={item.value}
            className={cssClasses.option}
          >
            <Template data={item} templateKey="item" {...templateProps} />
          </option>
        ))}
      </select>
    );
  }
}

export default autoHideContainerHOC(headerFooterHOC(MenuSelect));
