# Contributing

This repository contains the end-to-end (e2e) test suite for InstantSearch.

This test suite is meant to be shared across all InstantSearch flavors, which is why it lives in the monorepo.

## Development

### Installation

Running the tests

```sh
yarn test:e2e # Run the test suite on Chrome browser on your local machine
yarn test:e2e:saucelabs # Run the test suite on multiple browsers on the Sauce Labs service
```

The tests are run on the **e-commerce** example built for every flavor (with the addition of an UMD build for InstantSearch.js). You can filter on a single flavor by setting the `E2E_FLAVOR` environment variable:

```sh
E2E_FLAVOR="react" yarn test:e2e
# Possible values: js, js-umd, react, vue
```

When using the Sauce Labs service, tests are run on multiple browsers. To run a Sauce Labs test on a single browser, you can set the `E2E_BROWSER` environment variable:

```sh
E2E_BROWSER="internet explorer" yarn test:e2e:saucelabs
# Possible values: chrome, firefox, internet explorer
```

> [!NOTE]
> When running a Sauce Labs test locally, make sure examples are built with `yarn website:examples` and set the appropriate Sauce Labs environment variables: `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY`.
> Additionally, the Sauce Connect proxy doesn't support macOS in its latest version (4.9.2 in Jan. 2024). You can fix it to the previous version by setting the `SAUCE_CONNECT_VERSION=4.9.1` variable.

You can also run the tests with [WebdriverIO](https://webdriver.io) options. For example, to run a specific test in watch mode:

```sh
yarn test:e2e --spec pagination --watch
```

See [WebdriverIO CLI documentation](https://webdriver.io/docs/clioptions.html) for all available options.

### Writing tests

We use [WebdriverIO](https://webdriver.io) and [Jasmine](https://jasmine.github.io) to write the tests. WebdriverIO controls the browser (navigate, select elements, click, etc.) while Jasmine is used to make assertions.

All tests must go in the [`specs`](specs) directory and follow the `*.spec.ts` naming pattern. Each `*.spec.ts` file runs in a separate WebdriverIO session, and in parallel (to the limit of the `maxInstances` configuration parameter in `wdio.*.conf.js`).

The general rule is to test a single feature in one spec file—for example, pagination. If your test suite has a lot less or a lot more tests than the existing ones, you might have incorrectly scoped the feature you're trying to cover.

Each spec file represents a end-to-end scenario which tests a behavior from a user's point of view.

For example:

1. Load the `examples/js/e-commerce/` page
2. Click on the "Appliances" category
3. Click on rating "4 & up"
4. Assert whether or not the returned hits match the expected ones

This user scenario translates to the following spec:

```js
function createBrandAndQueryFilteringTestSuite(flavor: string) {
  const root = `examples/${flavor}/e-commerce/`;

  describe('search on a specific category', () => {
    it('navigates to the e-commerce demo', async () => {
      await browser.url(root);
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
}
```

Here are some general guidelines when writing end-to-end tests:

- Each separate step should be in its own `it` function. This isn't a hard rule, but it helps make the scenario more readable and properly [separate each action in Sauce Labs reports](https://user-images.githubusercontent.com/13209/62311104-56217d80-b48b-11e9-94dc-3c18b9ddc2af.png).
- All actions on the browser are asynchronous, so be sure to always `await` them. **Never run multiple asynchronous commands in parallel as it can confuse some browsers (Internet Explorer)**.
- Use [helper](#helpers) functions whenever possible, for readability but also for maintainability—if one widget is updated, we only have to updates its helpers without touching the tests.
- Only assert what you want to see on the page after an action—for example, is the checkbox selected, is the result list correct, etc.
- Only assert what you want to see on the page after an action (Is this checkbox selected? Is the result list correct? etc.)
- You may need to add some additional steps compared to the original scenario, to wait for some elements to update for example (this was not done in the example above for simplicity but you can find some examples [here](./specs/brand-and-query.spec.ts#L17-19) or [here](./specs/price-range.spec.ts#L16-32)).

### Helpers

A library of helpers is available in the [`helpers`](helpers) directory and are grouped by widget in the [`helpers/index.ts`](helpers/index.ts) file.

These helpers are here to simplify the writing of tests, their readability and their maintenance. You are strongly encouraged to use them in your tests and to contribute to the helpers library.

You can find more information about helpers in [WebdriverIO documentation](https://webdriver.io/docs/customcommands.html#adding-custom-commands).
