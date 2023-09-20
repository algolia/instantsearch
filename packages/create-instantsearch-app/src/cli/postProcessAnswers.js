const camelCase = require('lodash.camelcase');
const semver = require('semver');

const { fetchLibraryVersions } = require('../utils');

function capitalize(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function createNameAlternatives({ organization, name, templateConfig }) {
  return {
    packageName: `@${organization}/${
      templateConfig.packageNamePrefix || ''
    }${name}`,
    widgetType: `${organization}.${name}`,
    camelCaseName: camelCase(name),
    pascalCaseName: capitalize(camelCase(name)),
  };
}

async function getLibraryVersion(config, templateConfig) {
  const { libraryName } = templateConfig;
  const { libraryVersion } = config;

  if (libraryName && !libraryVersion) {
    const versions = await fetchLibraryVersions(libraryName);
    const latestStableVersion = semver.maxSatisfying(versions, '*', {
      includePrerelease: false,
    });

    // Return the latest available version when
    // the stable version is not available
    return latestStableVersion || versions[0];
  }

  return libraryVersion;
}

async function postProcessAnswers({
  configuration,
  answers,
  optionsFromArguments,
  templatePath,
  templateConfig,
}) {
  const combinedAnswers = {
    ...configuration,
    ...answers,
  };

  const alternativeNames = createNameAlternatives({
    ...combinedAnswers,
    templateConfig,
  });

  const libraryVersion = await getLibraryVersion(
    combinedAnswers,
    templateConfig
  );

  return {
    ...combinedAnswers,
    ...alternativeNames,
    libraryVersion,
    template: templatePath,
    installation: optionsFromArguments.installation,
    currentYear: new Date().getFullYear(),
    attributesForFaceting:
      Array.isArray(combinedAnswers.attributesForFaceting) &&
      combinedAnswers.attributesForFaceting.filter(
        (attribute) => attribute !== 'ais.dynamicWidgets'
      ),
    flags: {
      dynamicWidgets:
        Array.isArray(combinedAnswers.attributesForFaceting) &&
        combinedAnswers.attributesForFaceting.includes('ais.dynamicWidgets'),
      insights:
        Boolean(templateConfig.flags && templateConfig.flags.insights) &&
        semver.satisfies(libraryVersion, templateConfig.flags.insights),
    },
  };
}

module.exports = postProcessAnswers;
