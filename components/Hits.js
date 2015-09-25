var React = require('react');
var map = require('lodash/collection/map');

var Template = require('./Template');

class Hits extends React.Component {
  renderWithResults() {
    var template = this.props.hitTemplate;
    var templatesConfig = this.props.templatesConfig;
    var transformData = this.props.hitTransformData;

    var renderedHits = map(this.props.hits, function(hit) {
      return (
        <Template
          data={hit}
          transformData={transformData}
          key={hit.objectID}
          template={template}
          config={templatesConfig}
        />
      );
    }, this);

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    var data = this.props.results;
    var template = this.props.noResultsTemplate;
    var templatesConfig = this.props.templatesConfig;
    var transformData = this.props.noResultsTransformData;

    return (
      <div>
        <Template
          data={data}
          transformData={transformData}
          template={template}
          config={templatesConfig}
        />
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
  hitTemplate: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  hitTransformData: React.PropTypes.func,
  noResultsTemplate: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  templatesConfig: React.PropTypes.object.isRequired,
  noResultsTransformData: React.PropTypes.func
};

Hits.defaultProps = {
  hits: []
};

module.exports = Hits;
