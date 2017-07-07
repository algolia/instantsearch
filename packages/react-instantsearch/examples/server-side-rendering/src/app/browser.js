import React from 'react';
import { render } from 'react-dom';
import { App } from './index';

render(
  <App {...window.__APP_INITIAL_STATE__} />,
  document.getElementById('root')
);
