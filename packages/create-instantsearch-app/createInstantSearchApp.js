const fs = require('fs');
const path = require('path');
const buildTask = require('../tasks/common/build');
const cleanTask = require('../tasks/common/clean');

const {
  checkAppName,
  checkAppPath,
  getAllTemplates,
} = require('../shared/utils');

const allTemplates = getAllTemplates();

const OPTIONS = {
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
      return (
        allTemplates.includes(input) || fs.existsSync(`${input}/.template.js`)
      );
    },
    getErrorMessage() {
      return `The template directory must contain a configuration file \`.template.js\` or must be one of those: ${allTemplates.join(
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

function checkConfig(config) {
  Object.keys(OPTIONS).forEach(optionName => {
    const isOptionValid = OPTIONS[optionName].validate(config[optionName]);

    if (!isOptionValid) {
      const errorMessage = OPTIONS[optionName].getErrorMessage
        ? OPTIONS[optionName].getErrorMessage(config[optionName])
        : `The option \`${optionName}\` is required.`;

      throw new Error(errorMessage);
    }
  });
}

function noop() {}

function createInstantSearchApp(appPath, options = {}, tasks = {}) {
  const config = {
    ...options,
    template: allTemplates.includes(options.template)
      ? path.resolve('templates', options.template)
      : options.template,
    name: options.name || path.basename(appPath),
    installation: options.installation !== false,
    silent: options.silent === true,
    path: appPath ? path.resolve(appPath) : '',
  };

  checkConfig(config);

  const {
    setup = noop,
    build = buildTask,
    install = noop,
    clean = cleanTask,
    teardown = noop,
  } = tasks;

  async function create() {
    try {
      await setup(config);
    } catch (err) {
      return;
    }

    try {
      await build(config);

      if (config.installation) {
        try {
          await install(config);
        } catch (err) {
          await clean(config);
          return;
        }
      }
    } catch (err) {
      return;
    }

    await teardown(config);
  }

  return {
    create,
  };
}

module.exports = createInstantSearchApp;
