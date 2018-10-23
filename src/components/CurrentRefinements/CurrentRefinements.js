import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { isSpecialClick, capitalize } from '../../lib/utils.js';

const createItemKey = ({ attribute, value, type, operator }, index) =>
  `${[attribute, type, value, operator]
    .map(key => key)
    .filter(Boolean)
    .join(':')}#${index + 1}`;

const handleClick = callback => event => {
  if (isSpecialClick(event)) {
    return;
  }

  event.preventDefault();
  callback();
};

class CurrentRefinements extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.refinements, nextProps.refinements);
  }

  renderRefinement(refinement, index) {
    return (
      <li
        key={`${refinement.attribute}-${index}`}
        className={this.props.cssClasses.item}
      >
        <span className={this.props.cssClasses.label}>
          {capitalize(refinement.attribute)}:
        </span>

        {refinement.items.map((item, itemIndex) => (
          <span
            key={createItemKey(item, itemIndex)}
            className={this.props.cssClasses.category}
          >
            <span className={this.props.cssClasses.categoryLabel}>
              {item.attribute === 'query' ? <q>{item.label}</q> : item.label}
            </span>

            <button
              className={this.props.cssClasses.delete}
              onClick={handleClick(refinement.refine.bind(null, item))}
            >
              ✕
            </button>
          </span>
        ))}
      </li>
    );
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
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    categoryLabel: PropTypes.string.isRequired,
    delete: PropTypes.string.isRequired,
  }).isRequired,
  refinements: PropTypes.arrayOf(
    PropTypes.shape({
      attribute: PropTypes.string.isRequired,
      refine: PropTypes.func.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          attribute: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,
};

export default CurrentRefinements;
