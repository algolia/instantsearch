var React = require('react');
var map = require('lodash/collection/map');
var isString = require('lodash/lang/isString');

var Hogan = require('../templates/Hogan');
var TemplateFn = require('../templates/Function');

class Hits extends React.Component {
  render() {
    if (this.props.hits.length === 0) {
      return this.renderNoResults();
    }

    return this.renderWithResults();
  }

  renderWithResults() {
    var TemplateComponent = isString(this.props.hitTemplate) ? Hogan : TemplateFn;

    var renderedHits = map(this.props.hits, function(hit) {
      return <TemplateComponent data={hit} key={hit.objectID} template={this.props.hitTemplate} />;
    }, this);

    return <div>{renderedHits}</div>;
  }

  renderNoResults() {
    var TemplateComponent = isString(this.props.noResultsTemplate) ? Hogan : TemplateFn;

    return (
      <div><TemplateComponent template={this.props.noResultsTemplate} /></div>
    );
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
