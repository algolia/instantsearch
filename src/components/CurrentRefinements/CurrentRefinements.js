import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
// import Template from '../Template.js';
import { isSpecialClick, capitalize } from '../../lib/utils.js';

const createItemKey = ({ attribute, value, type, operator }) =>
  [attribute, value, type, operator].map(key => key || 'none').join(':');

class CurrentRefinements extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  handleClick = (event, { refinement, item }) => {
    if (isSpecialClick(event)) {
      return;
    }

    refinement.refine(item);
  };

  renderRefinement(refinement, index) {
    // const attribute = this.props.attributes[refinement.attribute] || {};
    // const attributeTemplates = attribute.template
    //   ? {
    //       templates: {
    //         item: attribute.template,
    //       },
    //     }
    //   : null;

    // return attribute.template ? (
    //   <li
    //     key={`${refinement.attribute}-${index}`}
    //     className={this.props.cssClasses.item}
    //     // onClick={event => this.handleClick(event, refinement, _item)}
    //   >
    //     <Template
    //       {...this.props.templateProps}
    //       // {...attributeTemplates}
    //       templateKey="item"
    //       data={{
    //         ...refinement,
    //         // ...attribute,
    //         cssClasses: this.props.cssClasses,
    //       }}
    //     />
    //   </li>
    // ) : (
    return (
      <li
        key={`${refinement.attribute}-${index}`}
        className={this.props.cssClasses.item}
      >
        <span className={this.props.cssClasses.label}>
          {capitalize(refinement.attribute)}:
        </span>

        {refinement.items.map(item => (
          <span
            key={createItemKey(item)}
            className={this.props.cssClasses.category}
          >
            <span className={this.props.cssClasses.categoryLabel}>
              {item.label}
            </span>

            <button
              className={this.props.cssClasses.delete}
              onClick={event => this.handleClick(event, { refinement, item })}
            >
              ✕
            </button>
          </span>
        ))}
      </li>
    );
    // );
  }

  render() {
    return (
      <div className={this.props.cssClasses.root}>
        <ul className={this.props.cssClasses.list}>
          {this.props.refinements.map((refinement, index) =>
            this.renderRefinement(refinement, index)
          )}
        </ul>
      </div>
    );
  }
}

CurrentRefinements.propTypes = {
  // attributes: PropTypes.object.isRequired,
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
      attribute: PropTypes.string.isRequired,
      refine: PropTypes.func.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          attribute: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default CurrentRefinements;
