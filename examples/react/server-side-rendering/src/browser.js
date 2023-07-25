import React from 'react';
import { hydrate } from 'react-dom';

import { createApp } from './createApp';

const { App, props } = createApp();

const __APP_INITIAL_STATE__ = window.__APP_INITIAL_STATE__;

delete window.__APP_INITIAL_STATE__;

hydrate(
  <App {...props} {...__APP_INITIAL_STATE__} />,
  document.getElementById('root')
);
