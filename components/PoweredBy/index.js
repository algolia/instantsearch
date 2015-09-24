var React = require('react');
var bem = require('../../lib/utils').bemHelper('as-powered-by');
var logo = require('url?limit=10000!./algolia_logo.png');

require('style?prepend!raw!./index.css');

class PoweredBy extends React.Component {
  render() {
    var poweredByDisplay = (this.props.display === true) ? 'block' : 'none';

    return (
      <div
        className={bem()}
        style={{display: poweredByDisplay}}
      >
        Powered by
        <a href="https://www.algolia.com/">
          <img
            className={bem('image')}
            src={logo}
          />
        </a>
      </div>
    );
  }
}

PoweredBy.propTypes = {
  display: React.PropTypes.bool
};

module.exports = PoweredBy;
