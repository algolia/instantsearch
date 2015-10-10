var React = require('react');
var map = require('lodash/collection/map');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.results.hits, (hit) => {
      return (
        <this.props.Template templateKey="hit" data={hit} key={hit.objectID} />
      );
    });

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    return (
      <div>
        <this.props.Template templateKey="empty" data={this.props.results} />
      </div>
    );
  }

  render() {
    if (this.props.results.hits.length > 0) {
      return this.renderWithResults();
    }
    return this.renderNoResults();
  }
}

Hits.propTypes = {
  Template: React.PropTypes.func,
  results: React.PropTypes.object
};

Hits.defaultProps = {
  results: {hits: []}
};

module.exports = Hits;
