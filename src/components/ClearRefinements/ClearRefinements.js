/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

const ClearRefinements = ({
  hasRefinements,
  refine,
  cssClasses,
  templateProps,
}) => (
  <div className={cssClasses.root}>
    <Template
      {...templateProps}
      templateKey="resetLabel"
      rootTagName="button"
      rootProps={{
        className: cx(cssClasses.button, {
          [cssClasses.disabledButton]: !hasRefinements,
        }),
        onClick: refine,
        disabled: !hasRefinements,
      }}
      data={{ hasRefinements }}
    />
  </div>
);

ClearRefinements.propTypes = {
  refine: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    button: PropTypes.string.isRequired,
    disabledButton: PropTypes.string.isRequired,
  }).isRequired,
  hasRefinements: PropTypes.bool.isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default ClearRefinements;
