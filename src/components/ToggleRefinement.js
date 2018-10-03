import React from 'preact-compat';
import PropTypes from 'prop-types';
import Template from './Template.js';

const ToggleRefinement = ({
  currentRefinement,
  refine,
  cssClasses,
  templateProps,
}) => (
  <div className={cssClasses.root}>
    <label className={cssClasses.label}>
      <input
        className={cssClasses.checkbox}
        type="checkbox"
        checked={currentRefinement.isRefined}
        onChange={event => refine(!event.target.checked)}
      />
      <Template
        rootTagName="span"
        rootProps={{ className: cssClasses.labelText }}
        templateKey="labelText"
        data={currentRefinement}
        {...templateProps}
      />
    </label>
  </div>
);

ToggleRefinement.propTypes = {
  currentRefinement: PropTypes.object.isRequired,
  refine: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    checkbox: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
  }).isRequired,
  templateProps: PropTypes.object,
};

export default ToggleRefinement;
