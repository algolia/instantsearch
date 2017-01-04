import React from 'react';
import ReactDOM from 'react-dom';
import App from './App-Multi-Index';
import App2 from './App-Hits-And-Facets';

ReactDOM.render(<App/>, document.getElementById('autocomplete-with-multi-indices'));
ReactDOM.render(<App2/>, document.getElementById('autocomplete-with-facets'));
