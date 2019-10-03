/** @jsx h */

import { h, Component, createElement } from 'preact';
import PropTypes from 'prop-types';

class PaginationLink extends Component {
  handleClick = event => {
    this.props.handleClick(this.props.pageNumber, event);
  };

  render() {
    const { cssClasses, label, ariaLabel, url, isDisabled } = this.props;

    let tagName = 'span';
    let attributes = {
      className: cssClasses.link,
      dangerouslySetInnerHTML: {
        __html: label,
      },
    };

    // "Enable" the element, by making it a link
    if (!isDisabled) {
      tagName = 'a';
      attributes = {
        ...attributes,
        'aria-label': ariaLabel,
        href: url,
        onClick: this.handleClick,
      };
    }

    const element = createElement(tagName, attributes);

    return <li className={cssClasses.item}>{element}</li>;
  }
}

PaginationLink.propTypes = {
  ariaLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  cssClasses: PropTypes.shape({
    item: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
  handleClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pageNumber: PropTypes.number,
  url: PropTypes.string,
};

export default PaginationLink;
