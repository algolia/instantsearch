var React = require('react');
var map = require('lodash/collection/map');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.results.hits, (hit) => {
      return (
        <this.props.Template
          data={hit}
          key={hit.objectID}
          templateKey="hit"
        />
      );
    });

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    return (
      <div>
        <this.props.Template
          data={this.props.results}
          templateKey="empty"
        />
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
