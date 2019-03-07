/* eslint import/namespace: ['error', { allowComputed: true }]*/

import * as widgets from './widgets';

export const plugin = {
  install(localVue) {
    Object.keys(widgets).forEach(widgetName => {
      localVue.component(widgets[widgetName].name, widgets[widgetName]);
    });
  },
};
