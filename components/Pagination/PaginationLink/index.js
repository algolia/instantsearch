'use strict';

var React = require('react');

class PaginationLink extends React.Component {
  render() {
    var label = this.props.label;
    var ariaLabel = this.props.ariaLabel;
    var href = this.props.href;
    var page = this.props.page;
    var className = this.props.className;

    return (
      <li className={className}>
        <a href={href} aria-label={ariaLabel} onClick={this.click.bind(this, page)}>
          {label}
        </a>
      </li>
    );
  }

  clickDisabled(e) {
    e.preventDefault();
  }

  click(page, e) {
    e.preventDefault();
    this.props.setCurrentPage(page).search();
  }
}

PaginationLink.propTypes = {
  ariaLabel: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  className: React.PropTypes.string,
  href: React.PropTypes.string.isRequired,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  page: React.PropTypes.number.isRequired,
  setCurrentPage: React.PropTypes.func.isRequired
};

module.exports = PaginationLink;
