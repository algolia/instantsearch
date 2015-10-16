var React = require('react');
var bem = require('../../lib/utils').bemHelper('ais-powered-by');
var cx = require('classnames');
var logo = require('./algolia-logo');

class PoweredBy extends React.Component {
  render() {
    var cssClasses = {
      root: cx(this.props.className, bem(null)),
      link: bem('link'),
      image: bem('image')
    };

    return (
      <div className={cssClasses.root}>
        Powered by
        <a className={cssClasses.link} href="https://www.algolia.com/">
          <img className={cssClasses.image} src={'data:image/png;base64,' + logo.base64} />
        </a>
      </div>
    );
  }
}

PoweredBy.propTypes = {
  className: React.PropTypes.string
};

module.exports = PoweredBy;
