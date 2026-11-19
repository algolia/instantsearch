import { renderComponent } from '@ember/renderer';

import { App } from './app.gjs';

import 'instantsearch.css/themes/satellite.css';
import './app.css';

renderComponent(App, { into: document.getElementById('app') });
