var hits = function(parameters){
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

module.exports = hits;
