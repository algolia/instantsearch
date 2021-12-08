import React from 'react';
import { hydrate } from 'react-dom';
import App from './App';

const SERVER_STATE = window.__SERVER_STATE__;

delete window.__SERVER_STATE__;

hydrate(<App serverState={SERVER_STATE} />, document.querySelector('#root'));
