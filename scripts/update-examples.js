const path = require('path');
const glob = require('glob');
const execSync = require('child_process').execSync;
const [version] = process.argv.slice(2);

const examplesPath = path.join(__dirname, '..', 'examples');

{
  // Update React InstantSearch DOM
  const examples = glob.sync(path.join(examplesPath, '!(react-native*)'));

  examples.forEach(example => {
    console.log('updating in', example);
    execSync(
      `cd ${example} && yarn upgrade react-instantsearch-dom@${version}`,
      {
        stdio: 'inherit',
      }
    );
  });
}

{
  // Update React InstantSearch Native
  const examples = glob.sync(path.join(examplesPath, '+(react-native*)'));

  examples.forEach(example => {
    console.log('updating in', example);
    // @TODO: update to react-instantsearch-native
    execSync(`cd ${example} && yarn upgrade react-instantsearch@${version}`, {
      stdio: 'inherit',
    });
  });
}

{
  // Update React InstantSearch DOM Maps
  const examples = glob.sync(path.join(examplesPath, 'geo-search'));

  examples.forEach(example => {
    console.log('updating in', example);
    execSync(
      `cd ${example} && yarn upgrade react-instantsearch-dom-maps@${version}`,
      {
        stdio: 'inherit',
      }
    );
  });
}
