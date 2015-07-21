var InstantSearch = require('./lib/InstantSearch');
var SearchBox = require('./components/SearchBox');
var Results = require('./components/Results');
var React = require( "react" );

module.exports = {
  InstantSearch : InstantSearch,
  widgets: {
    searchbox:function(parameters){
      var SearchBox = require('./components/SearchBox');
      var node = document.querySelector(parameters.selector);
      return {
        render: function(helper){
          React.render(<SearchBox helper={ helper }
                                  placeholder={ parameters.placeholder } />,
                       node);
        } 
      }
    },
    results:function(parameters){
      var Results = require('./components/Results');
      var node = document.querySelector(parameters.selector);

      var noResSelector = parameters.noResultsTemplate;
      var noResTemplate = ( function( sel ){
        if( !sel ) return '';
        var templateDom = document.querySelector( noResSelector );
        return templateDom ? templateDom.innerHTML : '';
      } )( noResSelector )

      var hitTemplateSelector = parameters.hitTemplate;
      if( !hitTemplateSelector ) throw new Error(
        "hitTemplate is a mandatory parameter and should be a selector to a valid template" );
      var hitTemplate = document.querySelector( hitTemplateSelector ).innerHTML;
      if( !hitTemplate ) throw new Error( "hit-template should be a selector to a valid template" );

      return {
        render: function(helper, state, results){
          React.render(<Results results={ results }
                                searchState={ state }
                                helper={ helper }
                                noResultsTemplate={ noResTemplate }
                                hitTemplate={ hitTemplate } />,
                       node);
        }
      };
    }
  }
}
