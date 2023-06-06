# Common test suites

To ensure InstantSearch widgets behave similarly in JavaScript, React and Vue, we needed framework agnostic tests suites to assert behaviors that needs to be consistent across flavors.

Each test suite is a function that exposes:
- A setup, which is the _arrange_ code passed by each flavor to set up test cases
- An act, to isolate the code that prepares the assertion. This is necessary when working with UI libraries like React.

The setup code is defined in the `common.test.{tsx|js}` file present in each package.

And for tests that can only apply to specific flavors, they can still reside inside their relevant packages. For reference, you can check out the common test suite of the Breadcrumb widget where

- common scenarios are described in [tests/common/widgets/breadcrumb](../../tests/common/widgets/breadcrumb)
- flavor specific tests are still in:
  - [packages/instantsearch.js/src/widgets/breadcrumb](../../packages/instantsearch.js/src/widgets/breadcrumb)
  - [packages/react-instantsearch-hooks-web/src/widgets/\__tests__](../../packages/react-instantsearch-hooks-web/src/widgets/__tests__)
  - [packages/vue-instantsearch/src/components/\__tests__](../../packages/vue-instantsearch/src/components/__tests__)

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

> **Note**
>If you need to use Testing Library queries, you can import [`screen`](https://testing-library.com/docs/queries/about#screen) from [`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro/) and call queries on it.

## Testing a new widget

If you created a new widget and you want to create common tests for them, the process is as follows:

- In `tests/common/widgets`, create a directory with the name of your widget (in kebab-case):
  - Create a file with the name of your test suite (e.g., `optimistic-ui.ts`, `options.ts`). In doubt, refer to existing test suites for existing widgets.
  - Create an `index.ts` file that exports a factory function to create your of test suite collection. You can copy one from an existing widget's test suite and modify it to suit your own widget.
- In your new test suite, export a factory function to create your test suite. You can copy one from an existing widget's test suite and modify it to suit your own widget.
- In each `common.test.{tsx|js}` file (in each package), import your test suite collection from `@instantsearch/tests`, and call it at the end of the file with the necessary test setup. You can copy one from the same file and modify it to suit your own widget.
