import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import upperFirst from 'lodash/upperFirst';
import Template from '../Template.js';
import { isSpecialClick } from '../../lib/utils.js';

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

class CurrentRefinements extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  renderItem(refinement, index) {
    const key =
      refinement.attributeName +
      (refinement.operator ? refinement.operator : ':') +
      (refinement.exclude ? refinement.exclude : '') +
      refinement.name;
    const attribute = this.props.attributes[refinement.attributeName] || {};
    const attributeTemplates = attribute.template
      ? {
          templates: {
            item: attribute.template,
          },
        }
      : null;

    return attribute.template ? (
      <li className={this.props.cssClasses.item} key={key}>
        <Template
          {...this.props.templateProps}
          {...attributeTemplates}
          templateKey="item"
          data={{
            ...refinement,
            ...attribute,
            cssClasses: this.props.cssClasses,
          }}
        />
      </li>
    ) : (
      <li className={this.props.cssClasses.item} key={key}>
        <span className={this.props.cssClasses.label}>
          {upperFirst(refinement.attributeName)}:
        </span>

        <span className={this.props.cssClasses.category}>
          <span className={this.props.cssClasses.categoryLabel}>
            {refinement.computedLabel}
          </span>

          <button
            className={this.props.cssClasses.delete}
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

CurrentRefinements.propTypes = {
  attributes: PropTypes.object.isRequired,
  clearRefinementClicks: PropTypes.arrayOf(PropTypes.func).isRequired,
  clearRefinementURLs: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  refinements: PropTypes.arrayOf(
    PropTypes.shape({
      attributeName: PropTypes.string.isRequired,
      computedLabel: PropTypes.string.isRequired,
    })
  ).isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default CurrentRefinements;
