# End-to-end test suite for InstantSearch

This package contains the end-to-end test suite for all InstantSearch flavors.

## Installation

The workspace automatically links the dependencies when you run `yarn` at the root of the monorepo.

## Running the test suite

In addition to the test suite, this package contains two [WebdriverIO](https://webdriver.io) configurations:

- `local`: run the test suite on [Chrome browser](https://google.com/chrome) on your local machine.
- `saucelabs`: run the test suite on multiple browsers on the [Sauce Labs service](https://saucelabs.com).

All configurations will run a static web server on your machine on port `5000` to serve the content of the `website` directory in your project, containing the InstantSearch demos to run our tests against.

### Locally

To run the test suite locally create a `wdio.local.conf.js` file in your project root and import the `local` configuration.

```js
const { local } = require('instantsearch-e2e-tests');

exports.config = local;
```

Then execute the following command to run the test suite.

```bash
./node_modules/.bin/wdio wdio.local.conf.js
```

### On Sauce Labs

To run the test suite on Sauce Labs create a `wdio.saucelabs.conf.js` file in your project root and import the `saucelabs` configuration.

```js
const { saucelabs } = require('instantsearch-e2e-tests');

exports.config = saucelabs;
```

#### Credentials

You'll need a username and access key to be able to run the test suite on Sauce Labs. You can find them in the User **Profile** > **User Settings** section of your Sauce Labs dashboard.

`instantsearch-e2e-tests` will read the username and access key from the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables respectively. More information about [setting up environment variables for Sauce Labs](https://wiki.saucelabs.com/display/DOCS/Best+Practice%3A+Use+Environment+Variables+for+Authentication+Credentials).

Alternatively you can store them in a `.env` file at the root of your project, `instantsearch-e2e-tests` will automatically load them using [dotenv](https://github.com/motdotla/dotenv). **But don't forget to add this file to your `.gitignore`.**

Once your config file created and your credentials set you can execute the following command to run the test suite.

```bash
./node_modules/.bin/wdio wdio.saucelabs.conf.js
```

## Overriding configuration

The default configuration can easily be overridden if you need to change some project specific settings.

```js
const { local } = require('instantsearch-e2e-tests');

exports.config = {
  ...local,
  /*
   * Run local tests on Firefox instead of Chrome
   */
  capabilities: [
    {
      browserName: 'firefox',
    },
  ],
};
```

## Sending reports to CircleCI

CircleCI can [read JUnit XML test metadata files](https://circleci.com/docs/2.0/collect-test-data/) to provide insights on the stability of the test suite. To enable this feature, you can add the following key to your e2e job in **.circleci/config.yml**:

```yaml
test_e2e:
  # ...
  steps:
    # ...
    - store_test_results:
      path: junit/wdio
```
