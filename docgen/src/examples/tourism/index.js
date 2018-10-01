import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

ReactDOM.render(
  <AppContainer>
    <App />
  </AppContainer>,
  document.querySelector('#app')
);

// Hot Module Replacement API
// this and AppContainer are react-hot-loader 3 API needs
// https://github.com/gaearon/react-hot-loader/blob/123d940ff34c3178549fec9d57b9378ff48b4841/docs/README.md
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;

    ReactDOM.render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      document.querySelector('#app')
    );
  });
}
