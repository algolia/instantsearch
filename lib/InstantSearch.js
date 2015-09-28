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
    this.templatesConfig = {
      helpers: {
        formatNumber(number) {
          return Number(number).toLocaleString(numberLocale);
        }
      },
      compileOptions: {}
    };
  }

  addWidget(widgetDefinition) {
    // Add the widget to the list of widget
    this.widgets.push(widgetDefinition);
  }

  start() {
    this.searchParameters = this.widgets.sort(function initLastSort(a, b) {
      // Widgets with the __initLast tag should provide configuration last
      if (a.__initLast === b.__initLast) return 0;
      return a.__initLast ? 1 : -1;
    }).reduce(function(configuration, widgetDefinition) {
      if (!widgetDefinition.getConfiguration) return configuration;

      // Update searchParameters with the configuration from the widgets
      var partialConfiguration = widgetDefinition.getConfiguration(configuration);
      return merge(
        {},
        configuration,
        partialConfiguration,
        (a, b) => {
          if (Array.isArray(a)) {
            return union(a, b);
          }
        }
      );
    }, this.searchParameters);

    var helper = algoliasearchHelper(
      this.client,
      this.searchParameters.index || this.indexName,
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
        templatesConfig: this.templatesConfig,
        results,
        state,
        helper
      });
    }, this);
  }

  _init(state, helper) {
    forEach(this.widgets, function(widget) {
      if (widget.init) {
        widget.init(state, helper, this.templatesConfig);
      }
    }, this);
  }
}

module.exports = InstantSearch;
