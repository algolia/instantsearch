'use strict';

var React = require('react');
var map = require('lodash/collection/map');

var baseURL = 'http://www.irce.com';

class Result extends React . Component {
  render() {
    var result = this.props.result;
    var sessions = map(result.sessions, function(session) {
      return <li className="" key={session.url}><a href={baseURL + session.url}>{ session.name }</a></li>;
    });
    var style = {
      float: 'left',
      background: '#aaa'
    };
    return <div className="col-xs-12 col-sm-6 col-lg-4" >
      <div className="result  panel panel-default" >
         <div className="panel-body">
           <img width="75" height="90" className="speaker-portrait" src={ result.image } style={ style }/>
           <div style={ {marginLeft: '90px', maxWidth: '100%'}}>
             <h1 className="speaker-name"><a href={baseURL + result.speakerUrl}>{ result.speakerName }</a></h1>
             <p className="speaker-position small">{ result.speakerPosition } at <a href={ result.companyUrl }>{ result.companyName }</a></p>
           </div>
           <hr style={{'clear': 'both'}} />
           <h2 className="speaker-session-title">Sessions</h2>
           <ul className="speaker-sessions">
             { sessions }
           </ul>
         </div>
       </div>
     </div>;
  }
}

module.exports = Result;
