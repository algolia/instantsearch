import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import cx from 'classnames';

import Template from '../Template.js';
import { isSpecialClick } from '../../lib/utils.js';

export class ClearRefinements extends Component {
  componentWillMount() {
    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.url !== nextProps.url ||
      this.props.hasRefinements !== nextProps.hasRefinements
    );
  }

  handleClick(e) {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    e.preventDefault();
    this.props.refine();
  }

  render() {
    const { hasRefinements, cssClasses } = this.props;
    const data = { hasRefinements };

    const rootClassNames = cx(cssClasses.root);
    const buttonClassNames = cx(cssClasses.button, {
      [cssClasses.disabledButton]: hasRefinements,
    });

    return (
      <div className={rootClassNames}>
        <Template
          data={data}
          templateKey="resetLabel"
          rootTagName="button"
          rootProps={{
            className: buttonClassNames,
            onClick: this.handleClick,
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
  url: PropTypes.string.isRequired,
};

export default ClearRefinements;
