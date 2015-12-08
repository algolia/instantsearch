let React = require('react');

class PoweredBy extends React.Component {
  render() {
    return (
      <div className={this.props.cssClasses.root}>
        Search by
        <a className={this.props.cssClasses.link} href="https://www.algolia.com/" target="_blank">Algolia</a>
      </div>
    );
  }
}

PoweredBy.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    link: React.PropTypes.string
  })
};

module.exports = PoweredBy;
