var React = require('react');

class PaginationLink extends React.Component {
  render() {
    var {className, label, ariaLabel, handleClick} = this.props;

    return (
      <li className={className}>
        <a
          ariaLabel={ariaLabel}
          className={className}
          href="#"
          onClick={handleClick}
          dangerouslySetInnerHTML={{__html: label}}
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
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  handleClick: React.PropTypes.func.isRequired
};

module.exports = PaginationLink;
