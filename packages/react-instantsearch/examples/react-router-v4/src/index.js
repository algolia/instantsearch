import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, Match } from 'react-router';

ReactDOM.render(
  <BrowserRouter>
    <Match 
      pattern="/"
      component={App}
    />
  </BrowserRouter>,
  document.getElementById('root')
);
