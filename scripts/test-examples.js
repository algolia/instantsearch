const path = require('path');
const glob = require('glob');
const execSync = require('child_process').execSync;

const examples = glob.sync(
  path.join(
    __dirname,
    '..',
    'examples',
    '!(default-theme|e-commerce|media|tourism)'
  )
);

examples.forEach((example) => {
  execSync(`cd ${example} && yarn && yarn build && yarn test`, {
    stdio: 'inherit',
  });
});
