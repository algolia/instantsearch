import React from 'react';
import Template from '../Template.js';
import {isSpecialClick} from '../../lib/utils.js';

class ClearAll extends React.Component {
  handleClick(e) {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    e.preventDefault();
    this.props.clearAll();
  }

  render() {
    const className = this.props.cssClasses.link;
    const data = {
      hasRefinements: this.props.hasRefinements
    };

    return (
      <a
        className={className}
        href={this.props.url}
        onClick={this.handleClick.bind(this)}
      >
        <Template
          data={data}
          templateKey="link"
          {...this.props.templateProps}
        />
      </a>);
  }
}

ClearAll.propTypes = {
  clearAll: React.PropTypes.func.isRequired,
  cssClasses: React.PropTypes.shape({
    link: React.PropTypes.string
  }),
  hasRefinements: React.PropTypes.bool.isRequired,
  templateProps: React.PropTypes.object.isRequired,
  url: React.PropTypes.string.isRequired
};

export default ClearAll;
