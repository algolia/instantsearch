# Creating a custom template

Besides all the InstantSearch templates provided, the Create InstantSearch API enables you to create your own template.

<details>
  <summary><strong>Contents</strong></summary>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Defining the template](#defining-the-template)
  - [`libraryName`](#libraryname)
  - [`tasks`](#tasks)
- [Injecting values to the template](#injecting-values-to-the-template)
- [Using the template](#using-the-template)
- [Examples](#examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## Defining the template

Once you've created a project directory, you can turn it into a template by adding a file `.template.js` at its root. This is the configuration file that drives `createInstantSearchApp()` to bootstrap your application.

This definition file returns a object with several properties.

<h6 align="center">.template.js</h6>

```javascript
const { execSync } = require('child_process');

module.exports = {
  libraryName: 'react-instantsearch',
  tasks: {
    install(config) {
      execSync(`cd ${config.path} && npm install`);
    },
    teardown(config) {
      console.log('Begin by running: npm start');
    },
  },
};
```

### `libraryName`

> `string` (optional) | no default

The name of the [npm](https://www.npmjs.com) library to fetch versions for.

### `tasks`

> `object` | defaults as follows

The tasks are hooks that define your [application generation lifecycle](#lifecycle). Each of these hooks are functions which receives the [app configuration](#configuration-object) as parameters. You can use this configuration to drive the application generation.

#### `setup(config: object)`

> No default

Can be leveraged to check the project requirements.

#### `build(config: object)`

> Defaults to copying and injecting the values

Can be leveraged to generate the project differently.

#### `install(config: object)`

> No default

Can be leveraged to install dependencies with a package manager.

#### `clean(config: object)`

> Defaults to deleting the project which installation has failed

Can be leveraged to warn the user that the installation has failed.

#### `teardown(config: object)`

> No default

Can be leveraged to display instructions to run the app.

<h6 align="center" id="lifecycle">Application generation lifeycle</h6>

![Setup → Build → Install → Clean (if installation fails) → Teardown](https://user-images.githubusercontent.com/6137112/41421858-f838c2a6-6ff7-11e8-8cef-4cc07f1f4f44.png)

<h6 align="center" id="configuration-object"><code>config</code> object</h6>

```js
{
  name: 'app-name',
  path: '/dev/app-name',
  template: 'InstantSearch.js',
  libraryVersion: '2.9.0',
  appId: 'APP_ID',
  apiKey: 'API_KEY',
  indexName: 'INDEX_NAME',
  attributesToDisplay: ['title', 'description'],
  installation: true,
  silent: false,
}
```

## Injecting values to the template

By default, the `build` task supports the [Handlebars](https://handlebarsjs.com) syntax to inject values passed to Create InstantSearch App. You can explicitly suffix the template files with `.hbs` or leave them as is (`.js` in this case).

<h6 align="center">App.js.hbs</h6>

```handlebars
import React, { Component } from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  SearchBox,
  {{#if attributesToDisplay}}
  Highlight,
  {{/if}}
} from 'react-instantsearch-dom';

const searchClient = algoliasearch(
  '{{appId}}',
  '{{apiKey}}'
);

<InstantSearch searchClient={searchClient} indexName="{{indexName}}">
  <SearchBox placeholder="{{searchPlaceholder}}" />
  {/* ... */}
</InstantSearch>
```

## Using the template

Create InstantSearch App reads your `.template.js` file and gets the specified tasks in the provided template.

Using the API:

```javascript
const app = createInstantSearchApp('my-app', {
  template: '/path/to/my-custom-template',
});

app.create();
```

Using the CLI:

```
create-instantsearch-app my-app --template /path/to/my-custom-template
```

## Examples

You can find all the officially supported templates in the [`src/templates/`](../src/templates) folder.
