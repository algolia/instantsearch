## Codemods

These codemods (code transformers) can be ran with `npx`. If you installed the `instantsearch.js` package already with `yarn`, you can run them like this: `yarn instantsearch-scripts`).

### `addWidget-to-addWidgetss`

This will replace calls to `addWidget(widget)` to `addWidgets([widget])`.

```
npx instantsearch.js addWidget-to-addWidgets <path>
```

### Notes

If you are using Prettier or eslint, make sure to run its autofixing after this transformation, since it's possible that code should be formatted differently after it has been transformed. For example in our repository using prettier that would be:

```
yarn prettier --write '{examples,stories,.storybook}/**/*.{js,ts,tsx}'
```
