'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils');

function searchbox(parameters) {
  var SearchBox = require('../../components/SearchBox');
  var container = utils.getContainerNode(parameters.container);
  return {
    init: function(initialState, helper) {
      React.render(<SearchBox helper={helper}
      placeholder={parameters.placeholder} />, container);
    }
  };
}

module.exports = searchbox;
