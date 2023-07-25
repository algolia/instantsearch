import React from 'react';
import ReactDOM from 'react-dom';

import Mentions from './App-Mentions';
import App from './App-Multi-Index';

ReactDOM.render(
  <App />,
  document.getElementById('autocomplete-with-multi-indices')
);

ReactDOM.render(<Mentions />, document.getElementById('autocomplete-mentions'));
