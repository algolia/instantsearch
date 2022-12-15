import React from 'react';
import ReactDOM from 'react-dom';
import App from './App-Multi-Index';
import Mentions from './App-Mentions';

ReactDOM.render(
  <App />,
  document.getElementById('autocomplete-with-multi-indices')
);

ReactDOM.render(<Mentions />, document.getElementById('autocomplete-mentions'));
