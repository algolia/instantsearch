import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import App from './App';

const SERVER_STATE = window.__SERVER_STATE__;

delete window.__SERVER_STATE__;

hydrateRoot(
  document.querySelector('#root'),
  <App serverState={SERVER_STATE} />
);
