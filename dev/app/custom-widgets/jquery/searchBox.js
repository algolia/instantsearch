/* eslint-disable import/default */
import throttle from 'lodash/throttle';
import instantsearch from '../../../../index.js';

const handleChange = ({query, refine, inputNode}) => () => {
  const inputValue = inputNode.val();
  if (inputValue !== query) refine(inputValue);
};

const renderFn = ({
  query,
  onHistoryChange,
  refine,
  widgetParams: {inputNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    const throttledSearch = throttle(
      handleChange({query, refine, inputNode}),
      300
    );

    inputNode.on('keyup', throttledSearch);
    inputNode.val(query);
  }
};

export default instantsearch.connectors.connectSearchBox(renderFn);
