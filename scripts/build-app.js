const path = require('path');
const { execSync } = require('child_process');

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

execSync(
  `yarn start ${appPath} \
    --name "${appName}" \
    --template "${templateName}"`,
  { stdio: 'inherit' }
);

execSync(`cd ${appPath} && yarn && yarn build`, { stdio: 'inherit' });
