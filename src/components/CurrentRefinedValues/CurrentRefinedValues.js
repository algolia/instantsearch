import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

import Template from '../Template';

import headerFooterHOC from '../../decorators/headerFooter';
import autoHideContainerHOC from '../../decorators/autoHideContainer';

import { isSpecialClick } from '../../lib/utils';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

export class RawCurrentRefinedValues extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  _clearAllElement(position, requestedPosition) {
    if (requestedPosition !== position) {
      return undefined;
    }

    const { refinements, cssClasses } = this.props;
    return (
      <a
        className={
          refinements && refinements.length > 0
            ? cssClasses.clearAll
            : `${cssClasses.clearAll} ${cssClasses.clearAll}-disabled`
        }
        href={this.props.clearAllURL}
        onClick={handleClick(this.props.clearAllClick)}
      >
        <Template templateKey="clearAll" {...this.props.templateProps} />
      </a>
    );
  }

  _refinementElement(refinement, i) {
    const attribute = this.props.attributes[refinement.attributeName] || {};
    const templateData = getTemplateData(
      attribute,
      refinement,
      this.props.cssClasses
    );
    const customTemplateProps = getCustomTemplateProps(attribute);
    const key =
      refinement.attributeName +
      (refinement.operator ? refinement.operator : ':') +
      (refinement.exclude ? refinement.exclude : '') +
      refinement.name;
    return (
      <div className={this.props.cssClasses.item} key={key}>
        <a
          className={this.props.cssClasses.link}
          href={this.props.clearRefinementURLs[i]}
          onClick={handleClick(this.props.clearRefinementClicks[i])}
        >
          <Template
            data={templateData}
            templateKey="item"
            {...this.props.templateProps}
            {...customTemplateProps}
          />
        </a>
      </div>
    );
  }

  render() {
    const refinements = map(this.props.refinements, (r, i) =>
      this._refinementElement(r, i)
    );
    return (
      <div>
        {this._clearAllElement('before', this.props.clearAllPosition)}
        <div className={this.props.cssClasses.list}>{refinements}</div>
        {this._clearAllElement('after', this.props.clearAllPosition)}
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
  return e => {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    e.preventDefault();
    cb();
  };
}

RawCurrentRefinedValues.propTypes = {
  attributes: PropTypes.object,
  clearAllClick: PropTypes.func,
  clearAllPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  clearAllURL: PropTypes.string,
  clearRefinementClicks: PropTypes.arrayOf(PropTypes.func),
  clearRefinementURLs: PropTypes.arrayOf(PropTypes.string),
  cssClasses: PropTypes.shape({
    clearAll: PropTypes.string,
    list: PropTypes.string,
    item: PropTypes.string,
    link: PropTypes.string,
    count: PropTypes.string,
  }).isRequired,
  refinements: PropTypes.array,
  templateProps: PropTypes.object.isRequired,
};

export default autoHideContainerHOC(headerFooterHOC(RawCurrentRefinedValues));
