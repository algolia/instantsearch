let React = require('react');

class PaginationLink extends React.Component {
  render() {
    let {className, label, ariaLabel, handleClick, url} = this.props;

    return (
      <li className={className}>
        <a
          ariaLabel={ariaLabel}
          className={className}
          dangerouslySetInnerHTML={{__html: label}}
          href={url}
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
  ]).isRequired,
  url: React.PropTypes.string
};

module.exports = PaginationLink;
