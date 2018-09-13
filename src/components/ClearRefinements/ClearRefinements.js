import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import cx from 'classnames';

import Template from '../Template.js';

export class ClearRefinements extends Component {
  render() {
    const { hasRefinements, cssClasses } = this.props;
    const data = { hasRefinements };

    const rootClassNames = cx(cssClasses.root);
    const buttonClassNames = cx(cssClasses.button, {
      [cssClasses.disabledButton]: !hasRefinements,
    });

    return (
      <div className={rootClassNames}>
        <Template
          data={data}
          templateKey="resetLabel"
          rootTagName="button"
          rootProps={{
            className: buttonClassNames,
            onClick: this.props.refine,
            disabled: !hasRefinements,
          }}
          {...this.props.templateProps}
        />
      </div>
    );
  }
}

ClearRefinements.propTypes = {
  refine: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    button: PropTypes.string,
    disabledButton: PropTypes.string,
  }),
  hasRefinements: PropTypes.bool.isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default ClearRefinements;
