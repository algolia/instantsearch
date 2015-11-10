let React = require('react');

class PaginationLink extends React.Component {
  render() {
    let {cssClasses, label, ariaLabel, handleClick, url} = this.props;

    return (
      <li className={cssClasses.item}>
        <a
          ariaLabel={ariaLabel}
          className={cssClasses.link}
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
  cssClasses: React.PropTypes.shape({
    item: React.PropTypes.string,
    link: React.PropTypes.string
  }),
  handleClick: React.PropTypes.func.isRequired,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  url: React.PropTypes.string
};

module.exports = PaginationLink;
