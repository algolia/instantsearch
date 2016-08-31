import React from 'react';
import {Router, Route} from 'react-router';
import ReactDOM from 'react-dom';

import history from './history';
import Search from './Search';

const container = document.getElementById('container');
ReactDOM.render(
  <Router history={history}>
    <Route path="/:page" component={Search} />
  </Router>,
  container
);
