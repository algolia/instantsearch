import { warn } from 'react-instantsearch-hooks';

warn(
  Date.now() < new Date('2023-08-09').getTime(),
  'The package `react-instantsearch-hooks-server` is replaced by `react-instantsearch`. The API is the same, but the package name has changed. Please update your dependencies and follow the migration guide: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/'
);

export * from './getServerState';
