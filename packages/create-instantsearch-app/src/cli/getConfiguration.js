const loadJsonFile = require('load-json-file');

async function getConfiguration({ options = {}, answers = {} } = {}) {
  const config = options.config
    ? await loadJsonFile(options.config) // From configuration file given as an argument
    : { ...options, ...answers }; // From the arguments and the prompt

  if (!config.template) {
    throw new Error('The template is required in the config.');
  }

  return config;
}

module.exports = getConfiguration;
