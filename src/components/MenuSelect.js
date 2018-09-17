import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';

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

    const noRefinements = items.length === 0;

    const rootClassNames = cx(cssClasses.root, {
      [cssClasses.noRefinementRoot]: noRefinements,
    });
    const selectClassNames = cx(cssClasses.select);
    const optionClassNames = cx(cssClasses.option);

    return (
      <div className={rootClassNames}>
        <select
          className={selectClassNames}
          value={selectedValue}
          onChange={this.handleSelectChange}
        >
          <Template
            templateKey="seeAllOption"
            rootTagName="option"
            rootProps={{
              value: '',
              className: optionClassNames,
            }}
            {...templateProps}
          />

          {items.map(item => (
            <Template
              data={item}
              templateKey="item"
              rootTagName="option"
              key={item.value}
              rootProps={{
                value: item.value,
                className: optionClassNames,
              }}
              {...templateProps}
            />
          ))}
        </select>
      </div>
    );
  }
}

export default MenuSelect;
