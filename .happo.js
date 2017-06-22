const path = require('path');
const FirefoxTarget = require('happo-target-firefox');

module.exports = {
  snapshotsFolder: 'test/screenshots',
  targets: [
    new FirefoxTarget({
      name: 'firefox',
      sourceFiles: ['test/.happo/tests.js'],
      stylesheets: [
        'storybook/public/default.css',
        'storybook/public/react-autosuggest.css',
        'storybook/public/rheostat.css',
        'storybook/public/util.css',
      ],
      viewports: {
        medium: {
          width: 640,
          height: 888,
        },
      },
    }),
  ],
};
