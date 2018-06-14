const algoliasearch = require('algoliasearch');
const latestSemver = require('latest-semver');
const loadJsonFile = require('load-json-file');

const {
  getAppTemplateConfig,
  fetchLibraryVersions,
  getTemplatePath,
} = require('../shared/utils');

function camelCase(string) {
  return string.replace(/-([a-z])/g, str => str[1].toUpperCase());
}

function getOptionsFromArguments(rawArgs) {
  let argIndex = 0;

  return rawArgs.reduce((allArgs, currentArg) => {
    argIndex++;

    if (!currentArg.startsWith('--') || currentArg.startsWith('--no-')) {
      return allArgs;
    }

    const argumentName = camelCase(currentArg.split('--')[1]);
    const argumentValue = rawArgs[argIndex];

    return {
      ...allArgs,
      [argumentName]: argumentValue,
    };
  }, {});
}

async function getAttributesFromAnswers({
  appId,
  apiKey,
  indexName,
  algoliasearchFn = algoliasearch,
} = {}) {
  const client = algoliasearchFn(appId, apiKey);
  const defaultAttributes = ['title', 'name', 'description'];
  let attributes = [];

  try {
    const { hits } = await client.search({ indexName, hitsPerPage: 1 });
    const [firstHit] = hits;
    const highlightedAttributes = Object.keys(firstHit._highlightResult);
    attributes = [
      ...new Set([
        ...defaultAttributes.map(
          attribute => highlightedAttributes.includes(attribute) && attribute
        ),
        ...highlightedAttributes,
      ]),
    ];
  } catch (err) {
    attributes = defaultAttributes;
  }

  return attributes;
}

function isQuestionAsked({ question, args }) {
  if (args.config) {
    return false;
  }

  for (const optionName in args) {
    if (question.name === optionName) {
      // Skip if the arg in the command is valid
      if (question.validate && question.validate(args[optionName])) {
        return false;
      }
    } else if (!question.validate) {
      // Skip if the question is optional and not given in the command
      return false;
    }
  }

  return true;
}

async function getConfiguration({
  options = {},
  answers = {},
  loadJsonFileFn = loadJsonFile,
} = {}) {
  const config = options.config
    ? await loadJsonFileFn(options.config) // From configuration file given as an argument
    : { ...options, ...answers }; // From the arguments and the prompt

  if (!config.template) {
    throw new Error('The template is required in the config.');
  }

  const templatePath = getTemplatePath(config.template);
  let { libraryVersion } = config;

  if (!libraryVersion) {
    const templateConfig = getAppTemplateConfig(templatePath);

    libraryVersion = await fetchLibraryVersions(
      templateConfig.libraryName
    ).then(latestSemver);
  }

  return {
    ...config,
    libraryVersion,
    template: templatePath,
  };
}

module.exports = {
  camelCase,
  getOptionsFromArguments,
  getAttributesFromAnswers,
  isQuestionAsked,
  getConfiguration,
};
