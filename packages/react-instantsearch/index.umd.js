/* eslint-disable */

// This file exists only for the legacy UMD `Core` file. Sinc eRollup
// is not able to correctly tree-shake the file we directly import the
// exported file. It avoid to have a huge jump in filesize (8KB => 40 KB).

// prettier-ignore
export { default as createConnector } from 'react-instantsearch-core/dist/es/core/createConnector';
