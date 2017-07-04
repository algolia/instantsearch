import {connectSearchBox} from '../../../../index.es6.js';

const renderFn = ({
  query,
  onHistoryChange,
  refine,
  widgetParams: {inputNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    inputNode.on('keyup', () => refine(inputNode.val()));
    inputNode.val(query);
  }
};

export default connectSearchBox(renderFn);
