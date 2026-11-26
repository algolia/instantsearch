/* eslint import/namespace: ['error', { allowComputed: true }]*/

import * as widgets from './widgets';

export const plugin = {
  install(localVue) {
    Object.keys(widgets).forEach((widgetName) => {
      const widget = widgets[widgetName];
      // The package also exports plain factories (e.g. the chat tool
      // factories) which are not components to register.
      if (widget && typeof widget === 'object') {
        localVue.component(widget.name, widget);
      }
    });
  },
};
