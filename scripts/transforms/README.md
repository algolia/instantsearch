## Codemods

These codemods should be ran with [`jscodeshift`](https://github.com/facebook/jscodeshift).

### addWidget / removeWidget

These should be replaced to `addWidgets` and `removeWidgets`.

```
yarn jscodeshift --transform scripts/transforms/addWidget-addWidgets.js --extensions='ts,js,tsx' examples stories .storybook
```

Make sure to run Prettier after!

```
yarn prettier --write '{examples,stories,.storybook}/**/*.{js,ts,tsx}'
```
