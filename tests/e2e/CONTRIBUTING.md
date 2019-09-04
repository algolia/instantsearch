# Contributing

This repository contains the end-to-end (e2e) test suite for [InstantSearch](https://github.com/algolia/instantsearch.js). This test suite is meant to be shared across all InstantSearch flavors, this is why it is stored in a separate repository.

## Development

### Requirements

To run this project, you will need:

- Node.js >= v8.10.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- Yarn >= v1.16.0 - [install instructions](https://yarnpkg.com/en/docs/install#alternatives-stable)

### Installation

The easiest way to work on the tests is to link them into an InstantSearch project using [`yarn link`](https://yarnpkg.com/en/docs/cli/link).

First, clone the `instantsearch-e2e-tests` repository, install its dependencies and link it.

```sh
git clone git@github.com:algolia/instantsearch-e2e-tests.git
cd instantsearch-e2e-tests
yarn
yarn link
```

Then, clone the [`instantsearch.js`](https://github.com/algolia/instantsearch.js/) repository (or any other flavor), install its dependencies and link `instantsearch-e2e-tests`.

```sh
git clone git@github.com:algolia/instantsearch.js
cd instantsearch.js
yarn
yarn link instantsearch-e2e-tests
```

You can now run your local end-2-end test suite using the `test:e2e:*` scripts from the InstantSearch project.

```sh
yarn test:e2e # Run the test suite on Chrome browser on your local machine
yarn test:e2e:saucelabs # Run the test suite on multiple browsers on the Sauce Labs service
```

You can also run the tests with [WebdriverIO](https://webdriver.io) options. For example, to run a specific test in watch mode:

```sh
yarn test:e2e --spec pagination --watch
```

See [WebdriverIO CLI documentation](https://webdriver.io/docs/clioptions.html) for all available options.

### Writing tests

We use [Webdriverio](https://webdriver.io) and [Jasmine](https://jasmine.github.io) to write the tests. Webdriverio is used to control the browser (navigate, select elements, clicks, etc.) while Jasmine is used to assert the results.

The tests must be stored in the [`specs`](specs) directory and follow the `*.spec.ts` naming pattern. Each `*.spec.ts` file will be executed in a new WebDriver session and if possible in parallel (to the limit of the `maxInstances` configuration parameter in `wdio.*.conf.js`).

In general, you should try to test a single feature in one spec file. Try to not have too many or too few tests in one file. However, there is no golden rule about that.

One spec file represents a scenario to test a behavior from a user point of view.

Example of scenario:

1. Load the `examples/e-commerce/` page
2. Click on "Appliances" category
3. Click on rating "4 & up"
4. Check if the result list matches the expected one

Which can be translated in a spec file to:

```js
describe('InstantSearch - Search on specific brand and query filtering', () => {
  it('navigates to the e-commerce demo', async () => {
    await browser.url('examples/e-commerce/');
  });

  it('selects "Appliances" category', async () => {
    await browser.setSelectedHierarchicalMenuItem('Appliances');
  });

  it('selects "4 & up" rating', async () => {
    await browser.setRatingMenuValue('4 & up');
  });

  it('must have the expected results', async () => {
    const hitsTitles = await browser.getHitsTitles();

    expect(hitsTitles).toEqual([
      'Nest - Learning Thermostat - 3rd Generation - Stainless Steel',
      'LG - 1.1 Cu. Ft. Mid-Size Microwave - Stainless-Steel',
      'Insignia™ - 2.6 Cu. Ft. Compact Refrigerator - Black',
      'Keurig - K50 Coffeemaker - Black',
      'iRobot - Roomba 650 Vacuuming Robot - Black',
      'Shark - Navigator Lift-Away Deluxe Bagless Upright Vacuum - Blue',
      'LG - 1.5 Cu. Ft. Mid-Size Microwave - Stainless Steel',
      'Insignia™ - 5.0 Cu. Ft. Chest Freezer - White',
      'Samsung - activewash 4.8 Cu. Ft. 11-Cycle High-Efficiency Top-Loading Washer - White',
      'Samsung - 4.8 Cu. Ft. 11-Cycle High-Efficiency Top-Loading Washer - White',
      'LG - 2.0 Cu. Ft. Full-Size Microwave - Stainless Steel',
      'Shark - Rotator Professional Lift-Away HEPA Bagless 2-in-1 Upright Vacuum - Red',
      'LG - 4.5 Cu. Ft. 8-Cycle High-Efficiency Top-Loading Washer - White',
      'Samsung - 4.2 Cu. Ft. 9-Cycle High-Efficiency Steam Front-Loading Washer - Platinum',
      'Panasonic - 1.3 Cu. Ft. Mid-Size Microwave - Stainless steel/black/silver',
      'LG - 2.0 Cu. Ft. Mid-Size Microwave - Black Stainless',
    ]);
  });
});
```

General guidelines when writing tests:

- Each step should be translated as a `it` function, while this is not mandatory it helps to make the scenario more readable and properly [separate each actions in Sauce Labs reports](https://user-images.githubusercontent.com/13209/62311104-56217d80-b48b-11e9-94dc-3c18b9ddc2af.png).
- All actions on the browser are asynchronous, so be sure to always `await` them. **Never run multiple asynchronous commands in parallel as it can confuse some browsers (Internet Explorer)**.
- Use helper functions when possible, for readability but also for maintainability (if one widget is updated, we only have to updates its helpers without touching the tests). [More about Helpers](#helpers).
- Do not make assertions to know if an action was correctly performed in the browser. If an action fails (trying to click on an non-existing element for example) then WebdriverIO will automatically throw and fail the test, so asserting on it ourselves is redundant.
- Only assert what you want to see on the page after an action (Is this checkbox selected? Is the result list correct? etc.)
- You may need to add some additional steps compared to the original scenario, to wait for some elements to update for example (this was not done in the example above for simplicity but you can find some examples [here](https://github.com/algolia/instantsearch-e2e-tests/blob/5a2456b8d63afa684931b0447f00df821b02752b/specs/brand-and-query.spec.ts#L14-L16) or [here](https://github.com/algolia/instantsearch-e2e-tests/blob/5a2456b8d63afa684931b0447f00df821b02752b/specs/price-range.spec.ts#L13-L22)).

### Helpers

A library of helpers is available in the [`helpers`](helpers) directory and are grouped by widget in the [`helpers/index.ts`](helpers/index.ts) file.

These helpers are here to simplify the writing of tests, their readability and their maintenance. You are strongly encouraged to use them in your tests and to contribute to the helpers library.

You can find more information about helpers in [WebdriverIO documentation](https://webdriver.io/docs/customcommands.html#adding-custom-commands).

## Release

This project uses [AngularJS's commit message convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines) with [Commitizen](http://commitizen.github.io/cz-cli/).

### Commit current changes

```sh
yarn commit
```

### Release a new version

```sh
yarn version
```

### Updating dependents projects

This package is not published on the npm registry. To update the test suite in an InstantSearch project, run the following command in it:

```sh
yarn add -D "algolia/instantsearch-e2e-tests#XXX"
```

(`XXX` being the tag for the version you want to install)

If [Renovate](https://renovatebot.com/) is enabled on your project then it should update it automatically like any other dependency.
