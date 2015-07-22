'use strict';

var React = require('react');
var map = require('lodash/collection/map');
var isString = require('lodash/lang/isString');

var Hogan = require('../templates/Hogan');
var TemplateFn = require('../templates/Function');

class Results extends React.Component {
  render() {
    var results = this.props.results;
    if (!results || !results.hits || results.hits.length === 0) {
      return this.renderNoResults(results, this.props.noResultsTemplate);
    }
    return this.renderWithResults(results.hits, this.props.hitTemplate);
  }
  renderWithResults(hits, hitTemplate) {
    var TemplateComponent = isString(hitTemplate) ? Hogan : TemplateFn;
    var renderedHits = map(hits, function(hit) {
      return <TemplateComponent data={hit} key={hit.objectID} template={hitTemplate} />;
    });
    return <div className="search_list search_results_container row">{renderedHits}</div>;
  }
  renderNoResults(results, noResultsTemplate) {
    var TemplateComponent = isString(noResultsTemplate) ? Hogan : TemplateFn;
    return <div className="search_list search_results_container row">
             <TemplateComponent data={results} template={noResultsTemplate} />
           </div>;
  }
}

module.exports = Results;
