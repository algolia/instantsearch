var React = require('react');
var map = require('lodash/collection/map');

var Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.hits, function(hit) {
      return <Template data={hit} key={hit.objectID} template={this.props.hitTemplate} />;
    }, this);

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    return (
      <div><Template template={this.props.noResultsTemplate} /></div>
    );
  }

  render() {
    var renderedHits = map(this.props.hits, function(hit) {
      return <Template data={hit} key={hit.objectID} template={this.props.hitTemplate} />;
    }, this);

    return <div>{renderedHits}</div>;
  }
}

Hits.propTypes = {
  hits: React.PropTypes.array,
  hitTemplate: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  noResultsTemplate: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired
};

Hits.defaultProps = {
  hits: []
};

module.exports = Hits;
