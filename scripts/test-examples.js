const path = require('path');
const glob = require('glob');
const execSync = require('child_process').execSync;
const fs = require('fs');

const examples = glob
  .sync(path.join(__dirname, '..', 'examples', '!(react-native*)'))
  .map((examplePath) => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(examplePath, 'package.json'))
    );

    return {
      path: examplePath,
      shouldRunTest: Boolean(pkg.scripts && pkg.scripts.test),
    };
  });

examples
  .filter((example) => example.shouldRunTest)
  .map((example) => example.path)
  .forEach((example) => {
    execSync(
      `cd ${example} && echo Testing $(basename $(pwd)) example && yarn test`,
      {
        stdio: 'inherit',
      }
    );
  });
