# Common test suites<!-- omit in toc -->

## Table of contents<!-- omit in toc -->

- [Adding new tests in an existing test suite](#adding-new-tests-in-an-existing-test-suite)
- [Testing a new widget](#testing-a-new-widget)

To ensure InstantSearch widgets behave similarly in InstantSearch.js, React InstantSearch, and Vue InstantSearch, we're using framework-agnostic tests suites to assert behaviors that should be consistent across flavors.

Each test suite is a function that exposes:

- **A setup**, which is the _arrange_ code passed by each flavor to set up test cases
- **An act**, to isolate the code that prepares the assertion. This is necessary when working with UI libraries like React.

> **Note** The setup code is defined in the `common-{widgets|connectors|shared}.test.{tsx|js}` file present in each package.

Tests that only apply to specific flavors belong to their relevant packages, as normal test suites. For reference, check out the common test suite of the breadcrumb widget:

- [Common scenarios](../../tests/common/widgets/breadcrumb)
- Flavor-specific tests:
  - [InstantSearch.js](../../packages/instantsearch.js/src/widgets/breadcrumb/__tests__)
  - [React InstantSearch](../../packages/react-instantsearch/src/widgets/__tests__)
  - [Vue InstantSearch](../../packages/vue-instantsearch/src/components/__tests__)

> **Note** Flavor-specific tests should be the exception. They should either cover inconsistencies between flavors that should go away in a next major, or assert flavor-specific behavior or APIs.

## Adding new tests in an existing test suite

If you need to add a new test for an existing widget in an existing test suite, you can add a new `test` block in the dedicated file and write your test here. This new test will run with every flavor.

```js
test('behaves as expected', async () => {
  // 1. Arrange
  // This leverages the `setup` function passed by each flavor.
  // You can pass options to InstantSearch (index name, search client)
  // and to the widgets.
  await setup({
    instantSearchOptions: {
      indexName: 'indexName',
      searchClient,
    },
    widgetParams: { attributes: hierarchicalAttributes },
  });

  // 2. Act
  // Any interaction must be wrapped in `act`, which is passed by each flavor.
  // You'll need to use `wait` before asserting as renders are asynchronous.
  await act(async () => {
    await wait(0);
  });

  // 3. Assert
  // You can assert anything here based on the `container` of the widget.
  expect(document.querySelector('.ais-Breadcrumb')).toMatchInlineSnapshot(`
    <!-- … -->
  `);
});
```

> **Note** If you need to use Testing Library queries, you can import [`screen`](https://testing-library.com/docs/queries/about#screen) from [`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro/) and call queries on it.

## Testing a new widget

If you created a new widget and you want to create common tests for them, the process is as follows:

- In [`tests/common/widgets`](tests/common/widgets), create a directory with the name of your widget (in kebab-case):
  - Create a file with the name of your test suite (e.g., `optimistic-ui.ts`, `options.ts`). In doubt, refer to existing test suites for existing widgets.
  - Create an `index.ts` file that exports a factory function to create your of test suite collection. You can copy one from an existing widget's test suite and modify it to suit your own widget.
- In your new test suite, export a factory function to create your test suite. You can copy one from an existing widget's test suite and modify it to suit your own widget.
- In each `common.test.{tsx|js}` file (in each package), import your test suite collection from `@instantsearch/tests`, and call it at the end of the file with the necessary test setup. You can copy one from the same file and modify it to suit your own widget.
