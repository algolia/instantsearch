var React = require('react');
var map = require('lodash/collection/map');

var Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    var renderedHits = map(this.props.results.hits, hit => {
      return (
        <div className={this.props.cssClasses.item}>
          <Template
            data={hit}
            key={hit.objectID}
            templateKey="item"
            {...this.props.templateProps}
          />
        </div>
      );
    });

    return <div className={this.props.cssClasses.root}>{renderedHits}</div>;
  }

  renderNoResults() {
    var className = `${this.props.cssClasses.root} ${this.props.cssClasses.empty}`;
    return (
      <div className={className}>
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
  results: React.PropTypes.object,
  templateProps: React.PropTypes.object.isRequired
};

Hits.defaultProps = {
  results: {hits: []}
};

module.exports = Hits;
