import PropTypes from 'prop-types';
import React from 'react';
import Template from '../Template.js';
import {isSpecialClick} from '../../lib/utils.js';

import autoHideContainer from '../../decorators/autoHideContainer.js';
import headerFooter from '../../decorators/headerFooter.js';

export class RawClearAll extends React.Component {
  componentWillMount() {
    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.url !== nextProps.url ||
      this.props.hasRefinements !== nextProps.hasRefinements;
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
    const data = {
      hasRefinements: this.props.hasRefinements,
    };

    return (
      <a
        className={this.props.cssClasses.link}
        href={this.props.url}
        onClick={this.handleClick}
      >
        <Template
          data={data}
          templateKey="link"
          {...this.props.templateProps}
        />
      </a>);
  }
}

RawClearAll.propTypes = {
  refine: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    link: PropTypes.string,
  }),
  hasRefinements: PropTypes.bool.isRequired,
  templateProps: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
};

export default autoHideContainer(headerFooter(RawClearAll));
