## Codemods

These codemods (code transformers) can be ran with [jscodeshift]((https://github.com/facebook/jscodeshift).

### `addWidget-to-addWidgets`

This will replace calls of `addWidget(widget)` to `addWidgets([widget])`, as well as `removeWidget(widget) to `removeWidgets([widget])`.

```
npx jscodeshift --transform scripts/transforms/addWidget-addWidgets.js --extensions='ts,js,tsx' <path>
```

### Notes

If you are using Prettier or ESLint, make sure to run its autofixing after this transformation, since code can be formatted differently after it has been transformed. For example, in our repository, the Prettier command would be:

```
yarn prettier --write '{examples,stories,.storybook}/**/*.{js,ts,tsx}'
```
