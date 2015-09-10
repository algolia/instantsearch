var algoliasearch = require('algoliasearch');
var algoliasearchHelper = require('algoliasearch-helper');

var forEach = require('lodash/collection/forEach');
var merge = require('lodash/object/merge');
var union = require('lodash/array/union');

class InstantSearch {
  constructor(applicationID, searchKey, indexName, searchParameters) {
    var client = algoliasearch(applicationID, searchKey);

    this.client = client;
    this.helper = null;
    this.indexName = indexName;
    this.searchParameters = searchParameters || {};
    this.widgets = [];
  }

  addWidget(widgetDefinition) {
    // Get the helper configuration from the widget
    if (widgetDefinition.getConfiguration) {
      var partialConfiguration = widgetDefinition.getConfiguration(this.searchParameters);
      this.searchParameters = merge(
        {},
        this.searchParameters,
        partialConfiguration,
        (a, b) => {
          if (Array.isArray(a)) {
            return union(a, b);
          }
        }
      );
    }
    // Add the widget to the list of widget
    this.widgets.push(widgetDefinition);
  }

  start() {
    var helper = algoliasearchHelper(
      this.client,
      this.indexName,
      this.searchParameters
    );
    this.helper = helper;

    this._init(helper.state, helper);
    helper.on('result', this._render.bind(this, helper));

    helper.search();
  }

  _render(helper, results, state) {
    forEach(this.widgets, function(widget) {
      if (widget.render) {
        widget.render(results, state, helper);
      }
    });
  }

  _init(state, helper) {
    forEach(this.widgets, function(widget) {
      if (widget.init) {
        widget.init(state, helper);
      }
    });
  }
}

module.exports = InstantSearch;
