#!/usr/bin/env node
const os = require('os');
const path = require('path');
const process = require('process');

const chalk = require('chalk');
const program = require('commander');
const inquirer = require('inquirer');
const semver = require('semver');

const { version } = require('../../package.json');
const createInstantSearchApp = require('../api');
const {
  checkAppPath,
  checkAppName,
  getAppTemplateConfig,
  fetchLibraryVersions,
  getTemplatesByCategory,
  getTemplatePath,
  splitArray,
} = require('../utils');

const getAnswersDefaultValues = require('./getAnswersDefaultValues');
const getAttributesFromIndex = require('./getAttributesFromIndex');
const getConfiguration = require('./getConfiguration');
const getFacetsFromIndex = require('./getFacetsFromIndex');
const isQuestionAsked = require('./isQuestionAsked');
const postProcessAnswers = require('./postProcessAnswers');

let appPathFromArgument;

program
  .storeOptionsAsProperties(false)
  .version(version, '-v, --version')
  .name('create-instantsearch-app')
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .option('--name <name>', 'The name of the application or widget')
  .option('--app-id <appId>', 'The application ID')
  .option('--api-key <apiKey>', 'The Algolia search API key')
  .option('--index-name <indexName>', 'The main index of your search')
  .option(
    '--attributes-to-display <attributesToDisplay>',
    'The attributes of your index to display in hits',
    splitArray
  )
  .option(
    '--attributes-for-faceting <attributesForFaceting>',
    'The attributes to display as filters',
    splitArray
  )
  .option('--template <template>', 'The InstantSearch template to use')
  .option('--library-version <version>', 'The version of the library')
  .option('--config <config>', 'The configuration file to get the options from')
  .option('--no-installation', 'Ignore dependency installation')
  .option('--no-interactive', 'Ask no interactive questions')
  .action(dest => {
    appPathFromArgument = dest;
  })
  .parse(process.argv);

const optionsFromArguments = program.opts();
const {
  attributesToDisplay = [],
  attributesForFaceting = [],
} = optionsFromArguments;

const getQuestions = ({ appName }) => ({
  application: [
    {
      type: 'list',
      name: 'libraryVersion',
      message: answers => `${answers.template} version`,
      choices: async answers => {
        const templatePath = getTemplatePath(answers.template);
        const templateConfig = getAppTemplateConfig(templatePath);
        const { libraryName } = templateConfig;

        try {
          const versions = await fetchLibraryVersions(libraryName);
          const latestStableVersion = semver.maxSatisfying(versions, '*', {
            includePrerelease: false,
          });

          if (!latestStableVersion) {
            return versions;
          }

          return [
            new inquirer.Separator('Latest stable version (recommended)'),
            latestStableVersion,
            new inquirer.Separator('All versions'),
            ...versions,
          ];
        } catch (err) {
          const fallbackLibraryVersion = '1.0.0';

          console.log();
          console.error(
            chalk.red(
              `Cannot fetch versions for library "${chalk.cyan(libraryName)}".`
            )
          );
          console.log();
          console.log(
            `Fallback to ${chalk.cyan(
              fallbackLibraryVersion
            )}, please upgrade the dependency after generating the app.`
          );
          console.log();

          return [
            new inquirer.Separator('Available versions'),
            fallbackLibraryVersion,
          ];
        }
      },
      when: answers => {
        const templatePath = getTemplatePath(answers.template);
        const templateConfig = getAppTemplateConfig(templatePath);

        return Boolean(templateConfig.libraryName);
      },
    },
    {
      type: 'input',
      name: 'appId',
      message: 'Application ID',
      default: 'latency',
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Search API key',
      default: '6be0576ff61c053d5f9a3225e2a90f76',
    },
    {
      type: 'input',
      name: 'indexName',
      message: 'Index name',
      default: 'instant_search',
    },
    {
      type: 'checkbox',
      name: 'attributesToDisplay',
      message: 'Attributes to display',
      suffix: `\n  ${chalk.gray(
        'Used to generate the default result template'
      )}`,
      pageSize: 10,
      choices: async answers => [
        {
          name: 'None',
          value: undefined,
        },
        new inquirer.Separator(),
        new inquirer.Separator('From your index'),
        ...(await getAttributesFromIndex(answers)),
      ],
      filter: attributes => attributes.filter(Boolean),
      when: ({ appId, apiKey, indexName }) =>
        attributesToDisplay.length === 0 && appId && apiKey && indexName,
    },
    {
      type: 'checkbox',
      name: 'attributesForFaceting',
      message: 'Attributes for faceting',
      suffix: `\n  ${chalk.gray('Used to filter the search interface')}`,
      pageSize: 10,
      choices: async answers => {
        const templatePath = getTemplatePath(answers.template);
        const templateConfig = getAppTemplateConfig(templatePath);

        const selectedLibraryVersion = answers.libraryVersion;
        const requiredLibraryVersion =
          templateConfig.flags && templateConfig.flags.dynamicWidgets;
        const supportsDynamicWidgets =
          selectedLibraryVersion &&
          requiredLibraryVersion &&
          semver.satisfies(selectedLibraryVersion, requiredLibraryVersion, {
            includePrerelease: true,
          });

        const dynamicWidgets = supportsDynamicWidgets
          ? [
              {
                name: 'Dynamic widgets',
                value: 'ais.dynamicWidgets',
                checked: true,
              },
              new inquirer.Separator(),
            ]
          : [];

        return [
          ...dynamicWidgets,
          new inquirer.Separator('From your index'),
          ...(await getFacetsFromIndex(answers)),
          new inquirer.Separator(),
        ];
      },
      filter: attributes => attributes.filter(Boolean),
      when: ({ appId, apiKey, indexName }) =>
        attributesForFaceting.length === 0 && appId && apiKey && indexName,
    },
  ],
  widget: [
    {
      type: 'input',
      name: 'organization',
      message: 'Organization (on npm)',
      validate(input) {
        return typeof input === 'string' && input.length > 0;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description',
      default() {
        const splitName = appName.split('-').join(' ');

        return `InstantSearch widget that makes a ${splitName}`;
      },
      validate(input) {
        return typeof input === 'string';
      },
    },
  ],
  initial: [
    {
      type: 'input',
      name: 'appPath',
      message: 'Project directory',
      askAnswered: true,
      validate(input) {
        try {
          return checkAppPath(input);
        } catch (err) {
          console.log();
          console.error(err.message);
          return false;
        }
      },
      when(answers) {
        try {
          return (
            answers.interactive &&
            !answers.config &&
            !checkAppPath(answers.appPath)
          );
        } catch (err) {
          return true;
        }
      },
    },
    {
      type: 'input',
      name: 'appName',
      message: 'The name of the application or widget',
      askAnswered: true,
      default(answers) {
        return path.basename(answers.appPath);
      },
      validate(input) {
        try {
          return checkAppName(input);
        } catch (err) {
          console.log();
          console.error(err.message);
          return false;
        }
      },
      when(answers) {
        try {
          return (
            answers.interactive &&
            !answers.config &&
            !checkAppName(answers.appName)
          );
        } catch (err) {
          return true;
        }
      },
    },
    {
      type: 'list',
      pageSize: 10,
      name: 'template',
      message: 'InstantSearch template',
      askAnswered: true,
      choices: () => {
        const templatesByCategory = getTemplatesByCategory();

        return Object.entries(templatesByCategory).reduce(
          (templates, [category, values]) => [
            ...templates,
            new inquirer.Separator(category),
            ...values,
          ],
          []
        );
      },
      validate(input) {
        // if a config is given, path is optional
        if (optionsFromArguments.config) {
          return true;
        }

        const isValid = Boolean(input);
        if (!isValid) {
          console.log('template is required');
        }
        return isValid;
      },
      when(answers) {
        return answers.interactive && !answers.config && !answers.template;
      },
    },
  ],
});

async function run() {
  const args = {
    ...optionsFromArguments,
    appPath: appPathFromArgument,
    appName: optionsFromArguments.name,
  };
  const initialQuestions = getQuestions({}).initial;
  const initialAnswers = {
    ...args,
    ...(await inquirer.prompt(initialQuestions, args)),
  };

  initialQuestions.forEach(question => {
    // .default doesn't get executed when "when" returns false
    if (!initialAnswers[question.name] && question.default) {
      const defaultValue = question.default(initialAnswers);
      initialAnswers[question.name] = defaultValue;
    }
    if (!question.validate(initialAnswers[question.name])) {
      process.exit(1);
    }
  });

  if (initialAnswers.appPath.startsWith('~/')) {
    initialAnswers.appPath = path.join(
      os.homedir(),
      initialAnswers.appPath.slice(2)
    );
  }

  const { appPath, appName, template } = initialAnswers;

  console.log();
  console.log(`Creating a new InstantSearch app in ${chalk.green(appPath)}.`);
  console.log();

  const configuration = await getConfiguration({
    options: {
      ...optionsFromArguments,
      name: appName,
    },
    answers: initialAnswers,
  });

  const templatePath = getTemplatePath(configuration.template);
  const templateConfig = getAppTemplateConfig(templatePath);

  const implementationType =
    templateConfig.category === 'Widget' ? 'widget' : 'application';

  const answers = await inquirer.prompt(
    getQuestions({ appName })[implementationType].filter(
      question => !isQuestionAsked({ question, args: optionsFromArguments })
    ),
    getAnswersDefaultValues(optionsFromArguments, configuration, template)
  );

  const app = createInstantSearchApp(
    appPath,
    await postProcessAnswers({
      configuration,
      answers,
      optionsFromArguments,
      templatePath,
      templateConfig,
    }),
    templateConfig.tasks
  );

  await app.create();
}

run().catch(err => {
  console.error(err.message);
  console.log();

  process.exit(2);
});

process.on('SIGINT', () => {
  process.exit(3);
});
