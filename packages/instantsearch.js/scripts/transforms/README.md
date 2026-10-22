## Codemods

These codemods (code transformers) can be ran with [jscodeshift]((https://github.com/facebook/jscodeshift).

### `addWidget-to-addWidgets`

This will replace calls of `addWidget(widget)` to `addWidgets([widget])`, as well as `removeWidget(widget) to `removeWidgets([widget])`.

```
npx @codeshift/cli --packages 'instantsearch-codemods#addWidget-to-addWidgets' <path>
```

### Notes

If you are using a formatter or a linter, make sure to run its autofixing after this transformation, since code can be formatted differently after it has been transformed. In our repository, that would be:

```
yarn format
```
