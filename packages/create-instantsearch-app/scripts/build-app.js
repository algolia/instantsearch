const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const usage = `
Usage:

node ${path.basename(process.argv[1])} <appPath> <templateName>`;

const [, , appPath, templateName] = process.argv;

if (!appPath) {
  console.error(`The \`appPath\` argument is missing.\n${usage}`);
  process.exit(1);
}

if (!templateName) {
  console.error(`The \`templateName\` argument is missing.\n${usage}`);
  process.exit(1);
}

const appName = path.basename(appPath);

const config = {
  template: templateName,
  appId: 'appId',
  apiKey: 'apiKey',
  indexName: 'indexName',
  searchPlaceholder: 'Search placeholder',
  attributesToDisplay: ['attribute1', 'attribute2'],
  attributesForFaceting: ['facet1', 'facet2'],
  organization: 'algolia',
};

const configFilePath = `cisa.config.json`;

fs.writeFileSync(configFilePath, JSON.stringify(config));

execSync(
  `yarn start ${appPath} \
    --name "${appName}" \
    --config "${configFilePath}"`,
  { stdio: 'inherit' }
);

execSync(`cd ${appPath} && yarn && yarn build`, { stdio: 'inherit' });
