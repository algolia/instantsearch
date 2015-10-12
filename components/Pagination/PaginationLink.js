var React = require('react');

class PaginationLink extends React.Component {
  handleClick(page, e) {
    e.preventDefault();
    this.props.setCurrentPage(page);
  }

  render() {
    var {className, label, ariaLabel, handleClick} = this.props;

    return (
      <li className={className}>
        <a
          ariaLabel={ariaLabel}
          className={className}
          dangerouslySetInnerHTML={{__html: label}}
          href="#"
          onClick={handleClick}
        ></a>
      </li>
    );
  }
}

PaginationLink.propTypes = {
  ariaLabel: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  className: React.PropTypes.string,
  handleClick: React.PropTypes.func.isRequired,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired
};

module.exports = PaginationLink;
