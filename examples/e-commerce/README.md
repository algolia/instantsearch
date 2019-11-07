# E-commerce demo

_This project was generated with [create-instantsearch-app](https://github.com/algolia/create-instantsearch-app) by [Algolia](https://algolia.com)._

## Get started

To run this project locally, install the dependencies and run the local server:

```sh
npm install
npm start
```

Alternatively, you may use [Yarn](https://http://yarnpkg.com/):

```sh
yarn
yarn start
```

Open http://localhost:3000 to see your app.

## Notes

This application is made for two reasons:

- end to end tests
- code that can be reused on a regular InstantSearch project

This means that some of the setup won't work out of the box on every machine. This requires that you:

- use a UNIX system (like Mac or Linux)
- build the library before starting this example:

```sh
yarn install && yarn build && (cd examples/e-commerce/ && yarn start)
```

Alternatively to that, you can remove the `alias` in package.json for `instantsearch.js` to `../../`
