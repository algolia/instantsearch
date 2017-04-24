/* eslint-disable import/default */
import throttle from 'lodash/throttle';
import instantsearch from '../../../../index.js';

const handleChange = ({query, search, inputNode}) => () => {
  const inputValue = inputNode.val();
  if (inputValue !== query) search(inputValue);
};

const renderFn = ({
  query,
  onHistoryChange,
  search,
  widgetParams: {inputNode},
}, isFirstRendering) => {
  if (isFirstRendering) {
    const throttledSearch = throttle(
      handleChange({query, search, inputNode}),
      300
    );

    inputNode.on('keyup', throttledSearch);
    inputNode.val(query);
  }
};

export default instantsearch.connectors.connectSearchBox(renderFn);
