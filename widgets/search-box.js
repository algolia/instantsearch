var React = require('react');

var utils = require('../lib/utils.js');

function searchbox(params) {
  var SearchBox = require('../components/SearchBox');

  var container = utils.getContainerNode(params.container);

  return {
    init: function(initialState, helper) {
      React.render(
        <SearchBox
          setQuery={helper.setQuery.bind(helper)}
          search={helper.search.bind(helper)}
          placeholder={params.placeholder}
          inputClass={params.cssClass}
          poweredBy={params.poweredBy}
        />,
        container
      );
    }
  };
}

module.exports = searchbox;
