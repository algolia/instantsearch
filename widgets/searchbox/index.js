'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils');

function searchbox(params) {
  var SearchBox = require('../../components/SearchBox');
  var container = utils.getContainerNode(params.container);

  return {
    init: function(initialState, helper) {
      React.render(
        <SearchBox
          helper={helper}
          placeholder={params.placeholder}
          inputClass={params.addClass} />, container
      );
    }
  };
}

module.exports = searchbox;
