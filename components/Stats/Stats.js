var React = require('react');

var Template = require('../Template');
var bem = require('../../lib/utils').bemHelper('ais-stats');
var cx = require('classnames');

require('style?prepend!raw!./stats.css');

class Stats extends React.Component {
  render() {
    var data = {
      hasManyResults: this.props.nbHits > 1,
      hasNoResults: this.props.nbHits === 0,
      hasOneResult: this.props.nbHits === 1,
      hitsPerPage: this.props.hitsPerPage,
      nbHits: this.props.nbHits,
      nbPages: this.props.nbPages,
      page: this.props.page,
      processingTimeMS: this.props.processingTimeMS,
      query: this.props.query,
      cssClasses: {
        root: cx(bem(null), this.props.cssClasses.root),
        time: cx(bem('time'), this.props.cssClasses.time)
      }
    };

    return (
      <this.props.Template data={data} templateKey="body" />
    );
  }
}

Stats.propTypes = {
  hitsPerPage: React.PropTypes.number,
  nbHits: React.PropTypes.number,
  nbPages: React.PropTypes.number,
  page: React.PropTypes.number,
  processingTimeMS: React.PropTypes.number,
  query: React.PropTypes.string
};

module.exports = Stats;
