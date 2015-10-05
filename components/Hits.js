var React = require('react');
var map = require('lodash/collection/map');

var Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.hits, (hit) => {
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
    if (this.props.hits.length > 0) {
      return this.renderWithResults();
    }
    return this.renderNoResults();
  }
}

Hits.propTypes = {
  Template: React.PropTypes.func,
  hits: React.PropTypes.arrayOf(React.PropTypes.object),
  results: React.PropTypes.object
};

Hits.defaultProps = {
  hits: []
};

module.exports = Hits;
