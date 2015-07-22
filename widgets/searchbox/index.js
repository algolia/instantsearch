'use strict';

var React = require('react');

var searchbox = function(parameters) {
  var SearchBox = require('../../components/SearchBox');
  var node = document.querySelector(parameters.selector);
  return {
    init: function(initialState, helper) {
      React.render(<SearchBox helper={ helper }
      placeholder={ parameters.placeholder } />,
        node);
    }
  };
};

module.exports = searchbox;
