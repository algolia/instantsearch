/* eslint import/namespace: ['error', { allowComputed: true }]*/
import Vue from 'vue';

import * as widgets from './widgets';

export const plugin = Object.assign({}, widgets, {
  install() {
    Object.keys(widgets).forEach(widgetName => {
      Vue.component(widgets[widgetName].name, widgets[widgetName]);
    });
  },
});
