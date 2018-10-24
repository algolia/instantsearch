import React from 'preact-compat';
import PropTypes from 'prop-types';
import { isSpecialClick, capitalize } from '../../lib/utils.js';

const createItemKey = ({ attribute, value, type, operator }) =>
  [attribute, type, value, operator]
    .map(key => key)
    .filter(Boolean)
    .join(':');

const handleClick = callback => event => {
  if (isSpecialClick(event)) {
    return;
  }

  event.preventDefault();
  callback();
};

const CurrentRefinements = ({ refinements, cssClasses }) => (
  <div className={cssClasses.root}>
    <ul className={cssClasses.list}>
      {refinements.map((refinement, index) => (
        <li
          key={`${refinement.attribute}-${index}`}
          className={cssClasses.item}
        >
          <span className={cssClasses.label}>
            {capitalize(refinement.attribute)}:
          </span>

          {refinement.items.map(item => (
            <span key={createItemKey(item)} className={cssClasses.category}>
              <span className={cssClasses.categoryLabel}>
                {item.attribute === 'query' ? <q>{item.label}</q> : item.label}
              </span>

              <button
                className={cssClasses.delete}
                onClick={handleClick(refinement.refine.bind(null, item))}
              >
                ✕
              </button>
            </span>
          ))}
        </li>
      ))}
    </ul>
  </div>
);

const RefinementItemPropTypes = PropTypes.shape({
  attribute: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
});

const RefinementPropTypes = PropTypes.shape({
  attribute: PropTypes.string.isRequired,
  refine: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(RefinementItemPropTypes).isRequired,
});

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
  refinements: PropTypes.arrayOf(RefinementPropTypes).isRequired,
};

export default CurrentRefinements;
