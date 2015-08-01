'use strict';

var React = require('react');

var utils = require('../../lib/widgetUtils');
var bind = require('lodash/function/bind');

function searchbox(params) {
  var SearchBox = require('../../components/SearchBox');
  var container = utils.getContainerNode(params.container);

  return {
    init: function(initialState, helper) {
      React.render(
        <SearchBox
          setQuery={bind(helper.setQuery, helper)}
          search={bind(helper.search, helper)}
          placeholder={params.placeholder}
          inputClass={params.addClass} />, container
      );
    }
  };
}

module.exports = searchbox;
