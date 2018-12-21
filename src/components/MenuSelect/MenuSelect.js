import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

class MenuSelect extends Component {
  static propTypes = {
    cssClasses: PropTypes.shape({
      root: PropTypes.string.isRequired,
      select: PropTypes.string.isRequired,
      option: PropTypes.string.isRequired,
    }).isRequired,
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

    const rootClassNames = cx(cssClasses.root, {
      [cssClasses.noRefinementRoot]: items.length === 0,
    });

    return (
      <div className={rootClassNames}>
        <select
          className={cssClasses.select}
          value={selectedValue}
          onChange={this.handleSelectChange}
        >
          <Template
            {...templateProps}
            templateKey="defaultOption"
            rootTagName="option"
            rootProps={{
              value: '',
              className: cssClasses.option,
            }}
          />

          {items.map(item => (
            <Template
              {...templateProps}
              templateKey="item"
              rootTagName="option"
              rootProps={{
                value: item.value,
                className: cssClasses.option,
              }}
              key={item.value}
              data={item}
            />
          ))}
        </select>
      </div>
    );
  }
}

export default MenuSelect;
