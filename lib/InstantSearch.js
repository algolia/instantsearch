'use strict';

var algoliasearch = require('algoliasearch');
var algoliasearchHelper = require('algoliasearch-helper');

var forEach = require('lodash/collection/forEach');
var bind = require('lodash/function/bind');
var merge = require('lodash/object/merge');

class InstantSearch {
  constructor(applicationID, searchKey, index, searchParameters) {
    var client = algoliasearch(applicationID, searchKey);

    this.client = client;
    this.helper = null;
    this.index = index;
    this.searchParameters = searchParameters || {};
    this.widgets = [];
  }

  addWidget(widgetDefinition) {
    // Get the helper configuration from the widget
    if (widgetDefinition.getConfiguration) {
      var partialConfiguration = widgetDefinition.getConfiguration(this.searchParameters);
      this.searchParameters = merge({}, this.searchParameters, partialConfiguration);
    }
    // Add the widget to the list of widget
    this.widgets.push(widgetDefinition);
  }

  start() {
    var helper = algoliasearchHelper(
      this.client,
      this.index,
      this.searchParameters
    );
    this.helper = helper;

    this._init(helper.state, helper);
    helper.on('result', bind(this._render, this, helper));

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
