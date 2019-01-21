const glob = require('glob');
const execSync = require('child_process').execSync;
const [version] = process.argv.slice(2);

{
  // Update React InstantSearch DOM
  const packages = glob.sync('examples/!(react-native*)');

  packages.forEach(path => {
    execSync(`cd ${path} && yarn upgrade react-instantsearch-dom@${version}`, {
      stdio: 'inherit',
    });
  });
}

{
  // Update React InstantSearch Native
  const packages = glob.sync('examples/+(react-native*)');

  packages.forEach(path => {
    // @TODO: update to react-instantsearch-native
    execSync(`cd ${path} && yarn upgrade react-instantsearch@${version}`, {
      stdio: 'inherit',
    });
  });
}

{
  // Update React InstantSearch DOM Maps
  const packages = glob.sync('examples/geo-search');

  packages.forEach(path => {
    execSync(
      `cd ${path} && yarn upgrade react-instantsearch-dom-maps@${version}`,
      {
        stdio: 'inherit',
      }
    );
  });
}
