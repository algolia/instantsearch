var React = require('react');

var utils = require('../lib/utils.js');

function searchbox(params) {
  var SearchBox = require('../components/SearchBox');

  var container = utils.getContainerNode(params.container);
  var isFocused = false;

  return {
    init: function(initialState, helper) {
      React.render(
        <SearchBox
          onFocus={()=> { isFocused = true; }}
          onBlur={()=> { isFocused = false; }}
          setQuery={helper.setQuery.bind(helper)}
          search={helper.search.bind(helper)}
          placeholder={params.placeholder}
          inputClass={params.cssClass}
          value={initialState.query}
          poweredBy={params.poweredBy}
        />,
        container
      );
    },

    render: function({state, helper}) {
      if (!isFocused) {
        React.render(
          <SearchBox
            onFocus={()=> { isFocused = true; }}
            onBlur={()=> { isFocused = false; }}
            setQuery={helper.setQuery.bind(helper)}
            search={helper.search.bind(helper)}
            placeholder={params.placeholder}
            inputClass={params.cssClass}
            value={state.query}
          />,
          container
        );
      }
    }
  };
}

module.exports = searchbox;
