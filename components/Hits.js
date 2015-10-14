var React = require('react');
var map = require('lodash/collection/map');

var Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.results.hits, (hit) => {
      return (
        <Template
          data={hit}
          key={hit.objectID}
          templateKey="hit"
          {...this.props.templateProps}
        />
      );
    });

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    return (
      <div>
        <Template
          data={this.props.results}
          templateKey="empty"
          {...this.props.templateProps}
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
