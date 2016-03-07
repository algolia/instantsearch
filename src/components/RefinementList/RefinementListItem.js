import React from 'react';

import Template from '../Template.js';
import isEqual from 'lodash/lang/isEqual';

class RefinementListItem extends React.Component {
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
      originalEvent
    });
  }

  render() {
    return (
      <div
        className={this.props.itemClassName}
        onClick={this.handleClick}
      >
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
  facetValueToRefine: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  handleClick: React.PropTypes.func.isRequired,
  isRefined: React.PropTypes.bool.isRequired,
  itemClassName: React.PropTypes.string,
  subItems: React.PropTypes.object,
  templateData: React.PropTypes.object.isRequired,
  templateKey: React.PropTypes.string.isRequired,
  templateProps: React.PropTypes.object.isRequired
};

export default RefinementListItem;
