var algoliasearch = require('algoliasearch');
var algoliasearchHelper = require('algoliasearch-helper');

var forEach = require('lodash/collection/forEach');
var merge = require('lodash/object/merge');
var union = require('lodash/array/union');

var EventEmitter = require('events').EventEmitter;

var urlSyncWidget = require('./url-sync');

function defaultCreateURL() { return '#'; }

class InstantSearch extends EventEmitter {
  constructor({
    appId = null,
    apiKey = null,
    indexName = null,
    numberLocale = 'en-EN',
    searchParameters = {},
    urlSync = null
  }) {
    super();
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
        formatNumber(number, render) {
          return Number(render(number)).toLocaleString(numberLocale);
        }
      },
      compileOptions: {}
    };
    this.urlSync = urlSync;
  }

  addWidget(widgetDefinition) {
    // Add the widget to the list of widget
    this.widgets.push(widgetDefinition);
  }

  start() {
    if (!this.widgets) throw new Error('No widgets were added to instantsearch.js');

    if (this.urlSync) {
      let syncWidget = urlSyncWidget(this.urlSync);
      this.createURL = syncWidget.createURL.bind(syncWidget);
      this.widgets.push(syncWidget);
    } else this.createURL = defaultCreateURL;

    this.searchParameters = this.widgets.reduce(enhanceConfiguration, this.searchParameters);

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
        helper,
        createURL: this.createURL
      });
    }, this);
    this.emit('render');
  }

  _init(state, helper) {
    forEach(this.widgets, function(widget) {
      if (widget.init) {
        widget.init(state, helper, this.templatesConfig);
      }
    }, this);
  }
}

function enhanceConfiguration(configuration, widgetDefinition) {
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
}

module.exports = InstantSearch;
