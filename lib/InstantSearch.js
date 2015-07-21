'use strict';

var algoliasearch = require('algoliasearch');
var algoliasearchHelper = require('algoliasearch-helper');

var forEach = require('lodash/collection/forEach');
var bind = require('lodash/function/bind');
var merge = require('lodash/object/merge');

class InstantSearch {
  constructor(applicationID, searchKey, index) {
    var client = algoliasearch(applicationID, searchKey);

    this.client = client;
    this.helper = null;
    this.index = index;
    this.initialConfiguration = {};
    this.widgets = [];
  }

  addWidget(widgetDefinition) {
    // Get the helper configuration from the widget
    if(widgetDefinition.getConfiguration){
      var partialConfiguration = widgetDefinition.getConfiguration();
      this.initialConfiguration = merge({}, this.initialConfiguration, partialConfiguration);
    }
    // Add the widget to the list of widget
    this.widgets.push(widgetDefinition); 
  }

  start() {
    var helper = algoliasearchHelper(
      this.client,
      this.index,
      this.initialConfiguration
    );
    this.helper = helper;

    helper.on('result', bind(this._render, this, helper));

    helper.search();
  }

  _render(helper, results, state){
    forEach(this.widgets, function(widget){
      widget.render(helper, state, results);
    });
  }
} 

module.exports = InstantSearch;
