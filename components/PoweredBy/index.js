var React = require('react');
var bem = require('../../lib/utils').bemHelper('as-powered-by');
var logo = require('url?limit=10000!./algolia_logo.png');

require('style?prepend!raw!./index.css');

class PoweredBy extends React.Component {
  render() {
    return (
      <div
        className={bem()}
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
};

module.exports = PoweredBy;
