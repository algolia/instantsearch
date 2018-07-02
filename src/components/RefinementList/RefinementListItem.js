import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

import Template from '../Template';
import isEqual from 'lodash/isEqual';

class RefinementListItem extends Component {
  componentWillMount() {
    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  handleClick(originalEvent) {
    this.props.handleClick({
      facetValueToRefine: this.props.facetValueToRefine,
      isRefined: this.props.isRefined,
      originalEvent,
    });
  }

  render() {
    return (
      <div className={this.props.itemClassName} onClick={this.handleClick}>
        <Template
          data={this.props.templateData}
          templateKey={this.props.templateKey}
          {...this.props.templateProps}
        />
        {this.props.subItems}
      </div>
    );
  }
}

RefinementListItem.propTypes = {
  facetValueToRefine: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleClick: PropTypes.func.isRequired,
  isRefined: PropTypes.bool.isRequired,
  itemClassName: PropTypes.string,
  subItems: PropTypes.object,
  templateData: PropTypes.object.isRequired,
  templateKey: PropTypes.string.isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default RefinementListItem;
