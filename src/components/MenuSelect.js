import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';

import Template from './Template';

class MenuSelect extends Component {
  static propTypes = {
    cssClasses: PropTypes.shape({
      root: PropTypes.string,
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
      <div className={cssClasses.root}>
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
      </div>
    );
  }
}

export default MenuSelect;
