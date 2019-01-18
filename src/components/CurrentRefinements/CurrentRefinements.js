import React from 'preact-compat';
import PropTypes from 'prop-types';
import { isSpecialClick, capitalize } from '../../lib/utils';

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

const CurrentRefinements = ({ items, cssClasses }) => (
  <div className={cssClasses.root}>
    <ul className={cssClasses.list}>
      {items.map((item, index) => (
        <li key={`${item.attribute}-${index}`} className={cssClasses.item}>
          <span className={cssClasses.label}>
            {capitalize(item.attribute)}:
          </span>

          {item.refinements.map(refinement => (
            <span
              key={createItemKey(refinement)}
              className={cssClasses.category}
            >
              <span className={cssClasses.categoryLabel}>
                {refinement.attribute === 'query' ? (
                  <q>{refinement.label}</q>
                ) : (
                  refinement.label
                )}
              </span>

              <button
                className={cssClasses.delete}
                onClick={handleClick(item.refine.bind(null, refinement))}
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

const RefinementPropTypes = PropTypes.shape({
  attribute: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
});

const ItemPropTypes = PropTypes.shape({
  attribute: PropTypes.string.isRequired,
  refine: PropTypes.func.isRequired,
  refinements: PropTypes.arrayOf(RefinementPropTypes).isRequired,
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
  items: PropTypes.arrayOf(ItemPropTypes).isRequired,
};

export default CurrentRefinements;
