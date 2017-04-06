/* eslint-disable import/default */
import * as vanillaWidgets from './custom-widgets/vanilla/index.js';

export default search => {
  search.addWidget(
    vanillaWidgets.clearAll({
      containerNode: document.getElementById('clear-all'),
    })
  );
};
