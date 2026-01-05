# React InstantSearch — CSS Example

[![Edit css](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/algolia/instantsearch/tree/master/examples/react/css)

This example showcases InstantSearch CSS styling capabilities using Next.js App Router.

_This project was generated with [create-instantsearch-app](https://github.com/algolia/instantsearch/tree/master/packages/create-instantsearch-app) by [Algolia](https://algolia.com)._

## Features

- Custom CSS styling for InstantSearch widgets
- Product listing with search and filtering
- Product details page with dynamic routing
- Dark theme support
- Chat widget integration

## Get started

To run this project locally, install the dependencies and run the local server:

```sh
npm install
npm run dev
```

Alternatively, you may use [Yarn](https://http://yarnpkg.com/):

```sh
yarn
yarn dev
```

Open http://localhost:3000 to see your app.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with global CSS
│   ├── page.tsx             # Home page
│   ├── Search.tsx           # Main search component
│   ├── globals.css          # Global styles
│   └── products/
│       └── [pid]/
│           ├── page.tsx     # Product details page
│           └── Product.tsx  # Product details component
├── components/
│   └── Panel.tsx            # Reusable Panel component
└── lib/
    └── client.ts            # Algolia client configuration
```
