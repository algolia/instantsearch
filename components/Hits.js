var React = require('react');
var map = require('lodash/collection/map');

var Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.hits, function(hit) {
      return (
        <this.props.Template templateKey="hit" data={hit} key={hit.objectID} />
      );
    }, this);

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    return (
      <div>
        <this.props.Template data={this.props.results} templateKey="empty" />
      </div>
    );
  }

  render() {
    if (this.props.hits.length > 0) {
      return this.renderWithResults();
    }
    return this.renderNoResults();
  }
}

Hits.propTypes = {
  hits: React.PropTypes.array,
  transformData: React.PropTypes.shape({
    hit: React.PropTypes.func,
    empty: React.PropTypes.func
  })
};

Hits.defaultProps = {
  hits: []
};

module.exports = Hits;
