import { createIndex } from 'react-instantsearch-core';

const Index = createIndex({
  Root: 'div',
  props: {
    className: 'ais-MultiIndex__root',
  },
});

export default Index;
