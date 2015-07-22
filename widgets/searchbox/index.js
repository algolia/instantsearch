'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils');

var searchbox = function(parameters) {
  var SearchBox = require('../../components/SearchBox');
  var container = utils.getContainerNode(parameters.container);
  return {
    init: function(initialState, helper) {
      var searchboxComponent = <SearchBox helper={ helper }
                                placeholder={ parameters.placeholder } />
      React.render(searchboxComponent, container);
    }
  };
};

module.exports = searchbox;
