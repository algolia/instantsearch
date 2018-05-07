import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import Template from '../Template.js';
import { isSpecialClick } from '../../lib/utils.js';

import autoHideContainer from '../../decorators/autoHideContainer.js';
import headerFooter from '../../decorators/headerFooter.js';

export class RawClearRefinements extends Component {
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

    return (
      <a
        className={
          hasRefinements
            ? cssClasses.link
            : `${cssClasses.link} ${cssClasses.link}-disabled`
        }
        href={this.props.url}
        onClick={this.handleClick}
      >
        <Template
          data={data}
          templateKey="link"
          {...this.props.templateProps}
        />
      </a>
    );
  }
}

RawClearRefinements.propTypes = {
  refine: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    link: PropTypes.string,
  }),
  hasRefinements: PropTypes.bool.isRequired,
  templateProps: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
};

export default autoHideContainer(headerFooter(RawClearRefinements));
