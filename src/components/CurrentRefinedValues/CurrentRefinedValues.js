import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import Template from '../Template.js';
import { isSpecialClick } from '../../lib/utils.js';

class CurrentRefinedValues extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  renderItem(refinement, index) {
    const attribute = this.props.attributes[refinement.attribute] || {};
    const templateData = getTemplateData(
      attribute,
      refinement,
      this.props.cssClasses
    );
    const customTemplateProps = getCustomTemplateProps(attribute);
    const key =
      refinement.attribute +
      (refinement.operator ? refinement.operator : ':') +
      (refinement.exclude ? refinement.exclude : '') +
      refinement.name;

    return (
      <li className={this.props.cssClasses.item} key={key}>
        <span className={this.props.cssClasses.label}>
          <Template
            {...this.props.templateProps}
            {...customTemplateProps}
            templateKey="item"
            data={templateData}
          />
          <button
            onClick={handleClick(this.props.clearRefinementClicks[index])}
          >
            ✕
          </button>
        </span>
      </li>
    );
  }

  render() {
    return (
      <div className={this.props.cssClasses.root}>
        <ul className={this.props.cssClasses.list}>
          {this.props.refinements.map((refinement, index) =>
            this.renderItem(refinement, index)
          )}
        </ul>
      </div>
    );
  }
}

function getCustomTemplateProps(attribute) {
  const customTemplateProps = {};

  if (attribute.template !== undefined) {
    customTemplateProps.templates = {
      item: attribute.template,
    };
  }
  if (attribute.transformData !== undefined) {
    customTemplateProps.transformData = attribute.transformData;
  }

  return customTemplateProps;
}

function getTemplateData(attribute, _refinement, cssClasses) {
  const templateData = cloneDeep(_refinement);

  templateData.cssClasses = cssClasses;
  if (attribute.label !== undefined) {
    templateData.label = attribute.label;
  }
  if (templateData.operator !== undefined) {
    templateData.displayOperator = templateData.operator;
    if (templateData.operator === '>=') {
      templateData.displayOperator = '&ge;';
    }
    if (templateData.operator === '<=') {
      templateData.displayOperator = '&le;';
    }
  }

  return templateData;
}

function handleClick(cb) {
  return event => {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    event.preventDefault();
    cb();
  };
}

CurrentRefinedValues.propTypes = {
  attributes: PropTypes.object,
  clearRefinementClicks: PropTypes.arrayOf(PropTypes.func),
  clearRefinementURLs: PropTypes.arrayOf(PropTypes.string),
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    categoryLabel: PropTypes.string.isRequired,
    delete: PropTypes.string.isRequired,
    reset: PropTypes.string.isRequired,
  }).isRequired,
  refinements: PropTypes.array,
  templateProps: PropTypes.object.isRequired,
};

export default CurrentRefinedValues;
