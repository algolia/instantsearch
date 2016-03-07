import React from 'react';

import Template from '../Template.js';

import {isSpecialClick} from '../../lib/utils.js';
import map from 'lodash/collection/map';
import cloneDeep from 'lodash/lang/cloneDeep';
import isEqual from 'lodash/lang/isEqual';

class CurrentRefinedValues extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  _clearAllElement(position, requestedPosition) {
    if (requestedPosition !== position) {
      return undefined;
    }
    return (
      <a
        className={this.props.cssClasses.clearAll}
        href={this.props.clearAllURL}
        onClick={handleClick(this.props.clearAllClick)}
      >
        <Template templateKey="clearAll" {...this.props.templateProps} />
      </a>
    );
  }

  _refinementElement(refinement, i) {
    const attribute = this.props.attributes[refinement.attributeName] || {};
    const templateData = getTemplateData(attribute, refinement, this.props.cssClasses);
    const customTemplateProps = getCustomTemplateProps(attribute);
    const key = refinement.attributeName +
      (refinement.operator ? refinement.operator : ':') +
      (refinement.exclude ? refinement.exclude : '') +
      refinement.name;
    return (
      <div
        className={this.props.cssClasses.item}
        key={key}
      >
        <a
          className={this.props.cssClasses.link}
          href={this.props.clearRefinementURLs[i]}
          onClick={handleClick(this.props.clearRefinementClicks[i])}
        >
          <Template data={templateData} templateKey="item" {...this.props.templateProps} {...customTemplateProps} />
        </a>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this._clearAllElement('before', this.props.clearAllPosition)}
        <div className={this.props.cssClasses.list}>
          {map(this.props.refinements, this._refinementElement, this)}
        </div>
        {this._clearAllElement('after', this.props.clearAllPosition)}
      </div>
    );
  }
}

function getCustomTemplateProps(attribute) {
  let customTemplateProps = {};
  if (attribute.template !== undefined) {
    customTemplateProps.templates = {
      item: attribute.template
    };
  }
  if (attribute.transformData !== undefined) {
    customTemplateProps.transformData = attribute.transformData;
  }
  return customTemplateProps;
}

function getTemplateData(attribute, _refinement, cssClasses) {
  let templateData = cloneDeep(_refinement);

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
  return (e) => {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    e.preventDefault();
    cb();
  };
}

CurrentRefinedValues.propTypes = {
  attributes: React.PropTypes.object,
  clearAllClick: React.PropTypes.func,
  clearAllPosition: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.bool
  ]),
  clearAllURL: React.PropTypes.string,
  clearRefinementClicks: React.PropTypes.arrayOf(
    React.PropTypes.func
  ),
  clearRefinementURLs: React.PropTypes.arrayOf(
    React.PropTypes.string
  ),
  cssClasses: React.PropTypes.shape({
    clearAll: React.PropTypes.string,
    list: React.PropTypes.string,
    item: React.PropTypes.string,
    link: React.PropTypes.string,
    count: React.PropTypes.string
  }).isRequired,
  refinements: React.PropTypes.array,
  templateProps: React.PropTypes.object.isRequired
};

export default CurrentRefinedValues;
