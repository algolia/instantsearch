## Codemods

These codemods (code transformers) can be ran with [jscodeshift](https://github.com/facebook/jscodeshift).

### `rish-to-ris`

This will replace all imports from `react-instantsearch-hooks` to their `react-instantsearch` equivalent.

```
npx jscodeshift --transform scripts/transforms/rish-to-ris.js --extensions='ts,js,tsx' <path>
```

### `ris-v6-to-v7`

This will :

- Replace `react-instantsearch-dom` imports to `react-instantsearch`
- Replace prop names to their new equivalent
- Replace `translations` keys to their new equivalent if they are defined inline, otherwise it will add a TODO comment
- Add some TODO comments to help you migrate

```
npx jscodeshift --transform scripts/transforms/ris-v6-to-v7.js --extensions='ts,js,tsx' <path>
```

### Notes

If you are using Prettier or ESLint, make sure to run its autofixing after this transformation, since code can be formatted differently after it has been transformed. For example, in our repository, the Prettier command would be:

```
yarn prettier --write '{examples,stories,.storybook}/**/*.{js,ts,tsx}'
```
