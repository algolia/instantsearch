import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import Template from '../Template.js';
import { isSpecialClick, capitalize } from '../../lib/utils.js';

class CurrentRefinements extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  handleClick = (event, index) => {
    if (isSpecialClick(event)) {
      return;
    }

    if (event.target.tagName === 'BUTTON') {
      event.preventDefault();
      this.props.clearRefinementClicks[index]();
    }
  };

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
      <li
        className={this.props.cssClasses.item}
        key={key}
        onClick={event => this.handleClick(event, index)}
      >
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
          {capitalize(refinement.attributeName)}:
        </span>

        <span className={this.props.cssClasses.category}>
          <span className={this.props.cssClasses.categoryLabel}>
            {refinement.computedLabel}
          </span>

          <button
            className={this.props.cssClasses.delete}
            onClick={event => this.handleClick(event, index)}
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
