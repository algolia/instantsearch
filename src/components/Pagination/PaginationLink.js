import React from 'react';

import isEqual from 'lodash/lang/isEqual';

class PaginationLink extends React.Component {
  componentWillMount() {
    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  handleClick(e) {
    this.props.handleClick(this.props.pageNumber, e);
  }

  render() {
    let {cssClasses, label, ariaLabel, url, isDisabled} = this.props;

    let tagName = 'span';
    let attributes = {
      className: cssClasses.link,
      dangerouslySetInnerHTML: {
        __html: label
      }
    };

    // "Enable" the element, by making it a link
    if (!isDisabled) {
      tagName = 'a';
      attributes = {
        ...attributes,
        ariaLabel,
        href: url,
        onClick: this.handleClick
      };
    }

    let element = React.createElement(tagName, attributes);

    return (
      <li className={cssClasses.item}>
        {element}
      </li>
    );
  }
}

PaginationLink.propTypes = {
  ariaLabel: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  cssClasses: React.PropTypes.shape({
    item: React.PropTypes.string,
    link: React.PropTypes.string
  }),
  handleClick: React.PropTypes.func.isRequired,
  isDisabled: React.PropTypes.bool,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  pageNumber: React.PropTypes.number,
  url: React.PropTypes.string
};

export default PaginationLink;
