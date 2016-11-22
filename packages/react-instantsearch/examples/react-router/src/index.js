import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
/* eslint-disable import/no-unresolved */
import {Router, Route, browserHistory} from 'react-router';
/* eslint-enable import/no-unresolved */

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}/>
  </Router>,
  document.getElementById('root')
);
