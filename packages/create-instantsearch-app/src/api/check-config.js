const fs = require('fs');
const path = require('path');

const { checkAppName, checkAppPath } = require('../utils');

function getOptions({ supportedTemplates }) {
  return {
    path: {
      validate(input) {
        // Side effect: `checkAppPath()` can throw
        return Boolean(input) && checkAppPath(input);
      },
    },
    name: {
      validate(input) {
        // Side effect: `checkAppName()` can throw
        return checkAppName(input);
      },
    },
    template: {
      validate(input) {
        return fs.existsSync(path.join(input || '', '.template.js'));
      },
      getErrorMessage() {
        return `The template directory must contain a configuration file \`.template.js\` or must be one of those: ${supportedTemplates.join(
          ', '
        )}`;
      },
    },
    installation: {
      validate(input) {
        return input === true || input === false;
      },
    },
  };
}

module.exports = function checkConfig(config, { supportedTemplates }) {
  const options = getOptions({ supportedTemplates });

  Object.keys(options).forEach((optionName) => {
    const isOptionValid = options[optionName].validate(config[optionName]);

    if (!isOptionValid) {
      const errorMessage = options[optionName].getErrorMessage
        ? options[optionName].getErrorMessage(config[optionName])
        : `The option \`${optionName}\` is required.`;

      throw new Error(errorMessage);
    }
  });
};
