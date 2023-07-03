This example shows how to use an external autocomplete component with `react-instantsearch`

[![Edit autocomplete](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/algolia/instantsearch/tree/master/examples/react/autocomplete)

It uses [react-autosuggest](https://github.com/moroshko/react-autosuggest) as the autocomplete external component.

You will find two use cases:

* How to build an autocomplete displaying hits from different indices
* How to build @-mentions using [ant](https://ant.design) as the external component

## Clone the example

```sh
curl https://codeload.github.com/algolia/instantsearch/tar.gz/master | tar -xz --strip=3 instantsearch-master/examples/react/autocomplete
```

## Start the example

```sh
yarn install --no-lockfile
yarn start
```


Read more about `react-instantsearch` [in our documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/).
