---
title: Routing and urls
mainTitle: Guides
layout: main.pug
category: guides
name: routing
withHeadings: true
editable: true
githubSource: docgen/src/guides/routing.md
---

Via the `routing` option, InstantSearch provides the necessary API entries to allow you to synchronize the state of your search UI (which widget were refined, what is the current search query ..) with any kind of storage. And most probably you want that storage to be the browser url bar.

Synchronizing your UI with the browser url is a good practice. It allows any of your users to take one of your result page, copy paste the browser url and send it to a friend. It also allows your users to use the back and next button of their browser and always endup where they were previously.

This guide provides you examples for the most common use cases along with some advanced ones. You can also read the [routing API reference](instantsearch.html#struct-RoutingOptions).

As you will see with advanced examples, creating your own url scheme to map your needs requires a significant amount of code but keep in mind you will need to do this only once, not every day!

## Simple url synchronization

For a quick start, you can activate the default behaviour:

```javascript
const search = instantsearch({
  // ... appId, apiKey...
  routing: true
});
```

The resulting url in your browser url bar will look like this:

`https://website.com/?query=a&refinementList%5Bbrand%5D%5B0%5D=Drama`

While not being pretty it is still very accurate: the query is `a` and the `brand` attribute, which is a `refinementList`, was refined (clicked) to `Drama`. But if you want something custom and clean, let's move on to more user friendly urls.

## User friendly urls

You might want your urls to look like:

`https://website.com/?query=a&brands=Sony~Samsung&page=2`

This way your users will be able to read them more easily when shared via emails, documents, social media...

To do so, the `routing` option accepts a simple boolean but also more complex objects to allow customization. The first customization option you want to use is `stateMapping`. It allows you to define more precisely how the state of your search will be synchronized to your browser url bar (or any other router storage you might have).

Here's an example achieving just that ([and here's the live version](https://codesandbox.io/s/005py264m0)):

This example assumes that you have added the [searchBox](widgets/searchBox.html), [refinementList](widgets/refinementList.html) and [pagination](widgets/pagination.html) widgets to your search UI. Then the `refinementList` is activated on the `brands` attribute. Please adjust given your own data.

```javascript
const search = instantsearch({
  // ... appId, apiKey...
  routing: {
    stateMapping: {
      stateToRoute(uiState) {
        return {
          query: uiState.query,
          // we use the character ~ as it is one that is rarely present in data and renders well in urls
          brands: uiState.refinementList && uiState.refinementList.brand.join('~'),
          page: uiState.page
        };
      },
      routeToState(routeState) {
        return {
          query: routeState.query,
          refinementList: {
            brand: routeState.brands && routeState.brands.split('~')
          },
          page: routeState.page
        };
      }
    }
  }
});
```

There's a lifecycle in which when the `stateMapping` functions are called:
- `stateToRoute` is called whenever widgets are refined (clicked). It is also called everytime any widget needs to create a URL.
- `routeToState` is called whenever the user loads, reloads the page or click on back/next buttons of the browser.

To build your own mapping easily, just `console.log(uiState)` and see what you're getting. Note that the object you return in `stateToRoute` will be the one you'll receive as an argument in `routeToState`.

## SEO friendly urls

You might also want your urls to look like:

`https://website.com/search/q/phone/brands/Sony~Samsung/p/1`

Be it for SEO benefits or to align your search UI urls with your current sitemap and existing url scheme.

Here's an example achieving just that ([and here's the live version](https://codesandbox.io/s/l5z6zz4yoq)):

```javascript
const search = instantsearch({
  // ... appId, apiKey...
  routing: {
    router: instantsearch.routers.history({
      windowTitle(routeState) {
        return `Website / Find ${routeState.q} in ${routeState.brands} brands`;
      },
      createURL(qsModule, routeState) {
        let baseUrl = window.location.href.split('/search/')[0];
        if (!routeState.q && routeState.brands === 'all' && routeState.p === 1) return baseUrl;
        if (baseUrl[baseUrl.length - 1] !== '/') baseUrl += '/';
        let routeStateArray = [
          'q', encodeURIComponent(routeState.q),
          'brands', encodeURIComponent(routeState.brands),
          'p', routeState.p
        ];

        return `${baseUrl}search/${routeStateArray.join('/')}`;
      },
      parseURL(qsModule, location) {
        let routeStateString = window.location.href.split('/search/')[1];
        if (routeStateString === undefined) return {};
        const routeStateValues = routeStateString.match(/^q\/(.*?)\/brands\/(.*?)\/p\/(.*?)$/);
        return {
          q: decodeURIComponent(routeStateValues[1]),
          brands: decodeURIComponent(routeStateValues[2]),
          p: routeStateValues[3]
        }
      },
    }),
    stateMapping: {
      stateToRoute(uiState) {
        return {
          q: uiState.query || '',
          brands: uiState.refinementList && uiState.refinementList.brand.join('~') || 'all',
          p: uiState.page || 1
        };
      },
      routeToState(routeState) {
        if (routeState.brands === 'all') routeState.brands = undefined;

        return {
          query: routeState.q,
          refinementList: {brand: routeState.brands && routeState.brands.split('~')},
          page: routeState.p
        };
      }
    }
  }
});
```

As you can see, we are now using the [instantsearch.routers.history](routing.html#instantsearchroutershistory-api) so that we can explicitly set options on the default router mechanism used in the previous example. What we see also is that both the `router` and `stateMapping` options can be used together as a way to easily map `uiState` to `routeState` and vice versa.

Using that we can configure:
- `windowTitle`: This method can be used to map the object (`routeState`) returned from `stateToRoute` to your window title
- `createURL`: This method is called everytime we need to create a url. When we want to synchronize the `routeState` to the browser url bar, when we want to render `<a href>` tags in the `menu` widget or when you call `createURL` in one of your connectors's rendering method
- `parseURL`: This method is called everytime the user loads, reloads the page or click on back/next buttons of the browser

### About SEO

For your search results to be part of search engines results, you will have to selectively choose them. Trying to have all of your search results inside search engines could be considered as spam by them.

To do that, you can create a [`robots.txt`](http://www.robotstxt.org/) and host it at `https://website.com/robots.txt`.

Here's an example one based on the url scheme we created.

```txt
User-agent: *
Allow: /search/q/phones/brands/Samsung/p1
Allow: /search/q/phones/brands/Apple/p1
Disallow: /search/
Allow: *
```

Now that you know how to create such advanced url synchronization mechanism, the only next step would be to create your own router. But let's first have a look at the full `uiState` reference.

## `instantsearch.routers.history` API

InstantSearch.js provides a default router under `instantsearch.routers.history`. You can use it when you want to go futher than just aliasing querystring parameters in the url. For example if you want to generate urls like `https://website.com/search/q/phone/brands/Sony~Samsung/p/1`.

### history(opts)
- **`opts.windowTitle: function(routeState)`**
This function allows you to dynamically customize the window title based on the provided `routeState`.
This function is called every time the user refines the UI, after the history timer.

You must return a `string`.

- **`opts.createURL: function({qsModule, location, routeState})`**
This function allows you to directly change the format of urls that will be created and rendered to the browser url bar or widgets.
This function is called everytime InstantSearch.js needs to create a URL. **The provided options** are:
  - *`qsModule`: object*, a querystring parsing and stringifying module, [full documentation](https://github.com/ljharb/qs). We use it internally so we provide it to you as a convenience
  - *`location`: function*, alias to window.location
  - *`routeState`: object*, the `routeState` created by the `stateMapping` provided. When no `stateMapping` is provided, this is an untouched `uiState`

You must return a `string`.

- **`opts.parseURL: function({qsModule, location})`**
This function is responsible for parsing back the url string to a `routeState`. This function must be customized if you customized the `createURL` function.
This function is called everytime the user loads, reloads or click on back/next buttons of the browser. **The provided options** are:
  - *`qsModule`: object*, a querystring parsing and stringifying module, [full documentation](https://github.com/ljharb/qs). We use it internally so we provide it to you as a convenience.
  - *`location`: function*, alias to window.location.

You must return an `object`. Which is a `routeState`.

- **`opts.writeDelay: number, default 400`**
This option controls the number of milliseconds to wait before actually writing the new url to the browse urlr bar. You can think about it this way:
"400ms after the last user action, let's save it to the browser url bar". Which helps in reducing:
1. The number of different history entries. If you type "phone" you don't want to have 5 history entries and thus have to click 5 times on the back button to go back to the previous search state
2. The performance overhead of updating the browser url bar too often. We have seen recurring but hard to track performance issues of updating the browser url bar too often due to a lot of browser extensions reacting to it

400ms is a good guesstimate from our experience to consider a user action "done" and thus save it to the url.

## `uiState` object reference

The `routeState` object shape is completely up to you and thus not part of any public API.

But the `uiState` object is created by InstantSearch.js internally and thus part of a public API. Every widget inside the library has its own way of updating it. Here's a complete `uiState` of all widgets. So that you can easily see, given the widgets you use, what you will receive:

```javascript
{
  query: 'Hill valley',
  menu: {
    type: 'antique'
  },
  hierarchicalMenu: {
    category: 'Decoration > Clocks'
  },
  refinementList: {
    colors: ['white', 'black']
  },
  numericRefinementList: {
    heightInCm: 40
  },
  numericSelector: {
    widthInCm: 30
  },
  priceRanges: {
    price: '200-20000'
  },
  range: {
    ageInYears: '2-10'
  },
  starRating: {
    rating: 3
  },
  toggle: {
    freeShipping: true
  },
  sortBy: 'most_popular_index',
  page: 2,
  hitsPerPage: 20
}
```

## Migrating from `urlSync`

If you were previously using the `urlSync` option, you should migrate to the new `routing` feature since `urlSync` will be removed in a next major version.

- `urlSync: true` becomes `routing: true`
- `threshold` becomes `routing: {router: instantsearch.routers.history({writeDelay: 400})}
- `mapping` and `trackedParameters` are replaced with `stateMapping`. Read [User friendly urls](#user-friendly-urls) to know how to configure it
- `useHash` is removed but can be achieved using an advanced configuration of the [history router](#history-router-api)
- `getHistoryState` is removed but can be achieved using an advanced configuration of the [history router](#history-router-api)
