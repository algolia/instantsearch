var algoliasearch = require('algoliasearch');
var algoliasearchHelper = require('algoliasearch-helper');

var forEach = require('lodash/collection/forEach');
var merge = require('lodash/object/merge');
var union = require('lodash/array/union');

class InstantSearch {
  constructor({
    appId = null,
    apiKey = null,
    indexName = null,
    numberLocale = 'en-EN',
    searchParameters = {}
  }) {
    if (appId === null || apiKey === null || indexName === null) {
      var usage = `
Usage: instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name'
});`;
      throw new Error(usage);
    }

    var client = algoliasearch(appId, apiKey);

    this.client = client;
    this.helper = null;
    this.indexName = indexName;
    this.searchParameters = searchParameters || {};
    this.widgets = [];
    this.templateHelpers = {
      formatNumber(number) {
        return Number(number).toLocaleString(numberLocale);
      }
    };
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
      if (!widget.render) {
        return;
      }
      widget.render({
        templateHelpers: this.templateHelpers,
        results,
        state,
        helper
      });
    }, this);
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
