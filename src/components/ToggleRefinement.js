import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from './Template.js';

const ToggleRefinement = ({
  currentRefinement,
  refine,
  cssClasses,
  templateProps,
}) => (
  <div className={cx(cssClasses.root)}>
    <label className={cx(cssClasses.label)}>
      <input
        className={cx(cssClasses.checkbox)}
        type="checkbox"
        checked={currentRefinement.isRefined}
        onChange={event => refine(!event.target.checked)}
      />
      <Template
        rootTagName="span"
        rootProps={{ className: cx(cssClasses.labelText) }}
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
    root: PropTypes.string,
    label: PropTypes.string,
    checkbox: PropTypes.string,
    labelText: PropTypes.string,
  }),
  templateProps: PropTypes.object,
};

export default ToggleRefinement;
