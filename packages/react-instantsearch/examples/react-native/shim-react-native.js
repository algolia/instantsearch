// The XMLHttpRequest is required since the AlgoliaSearchClient use it globally.
// Since `react-native@0.49.x` the `InitializeCore` module is not executed anymore
// and so the polyfills are not applied in Jest environment.
// see on 0.48.4: https://github.com/facebook/react-native/blob/v0.48.4/jest/setup.js#L37
// see on 0.49.x: https://github.com/facebook/react-native/blob/v0.49.0/jest/setup.js#L37
// eslint-disable-next-line
global.XMLHttpRequest = require('XMLHttpRequest');
