/**
 * `@instantsearch/mocks` builds its v5 client with the Node requester.
 * The tests run in a browser, so they get the XHR requester instead.
 * The mocks replace `search`, so no request leaves the browser.
 */
export { createXhrRequester as createHttpRequester } from '@algolia/requester-browser-xhr';
