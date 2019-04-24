import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import { isEqual } from '../../lib/utils';
import Template from '../Template/Template';

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
      <li className={this.props.className} onClick={this.handleClick}>
        <Template
          {...this.props.templateProps}
          templateKey={this.props.templateKey}
          data={this.props.templateData}
        />
        {this.props.subItems}
      </li>
    );
  }
}

RefinementListItem.propTypes = {
  facetValueToRefine: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleClick: PropTypes.func.isRequired,
  isRefined: PropTypes.bool.isRequired,
  subItems: PropTypes.object,
  templateData: PropTypes.object.isRequired,
  templateKey: PropTypes.string.isRequired,
  templateProps: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export default RefinementListItem;
