export * from 'react-instantsearch-core';
export * from './widgets';
export * from './components';
// Names that exist both in `instantsearch-core` and in this package: the React
// export wins (an explicit export shadows a star export).
export { SortBy } from './widgets';
// @internal Internal exports (not part of the public API)
export * from './lib/useStickToBottom';
