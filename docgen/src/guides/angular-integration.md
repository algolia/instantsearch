---
title: Integrate with Angular (2+)
mainTitle: Guides
layout: main.pug
category: guides
name: integrate-angular
withHeadings: true
navWeight: 9
editable: true
githubSource: docgen/src/guides/angular-integration.md
---

## Introduction

**Update:** We're happy to announce the release of the beta version of [Angular InstantSearch](https://github.com/algolia/angular-instantsearch)!

Angular InstantSearch will help you to create instant-search experiences with [Algolia](https://www.algolia.com) with customisable UI components.

We'd love for you to try it out and give us your opinion! The library is open source and can be found on [GitHub](https://github.com/algolia/angular-instantsearch).

Give it a try! It takes 5 minutes to build an instant-search example with our [getting started](https://algolia.gitbooks.io/angular-instantsearch).

---

In this guide we will learn together step by step how to integrate InstantSearch.js into an Angular (2+) application.

At the end of this guide you will have an Angular application running with an InstantSearch.js search experience!

For the rest of the guide we assume that you have some Angular knowledge and the angular-cli installed on your machine. If it's not the case have a look at the awesome lessons on [egghead.io](https://egghead.io/lessons/angular-2-say-hello-world-to-angular-2).

If you are new to InstantSearch.js, best is to read first the [getting started](https://community.algolia.com/instantsearch.js/v2/getting-started.html) guide.

Before going through this guide, it's well recommended to read the [customize widgets](https://community.algolia.com/instantsearch.js/v2/guides/customization.html) and the [introduce to connectors](https://community.algolia.com/instantsearch.js/v2/connectors.html) guides for InstantSearch.js

## Create an Angular app

We will create a default Angular application using the [angular-cli](http://yarn.fyi/@angular/cli), this is done like this:

```sh
$ ng new [project-name]
$ cd [project-name]
```

Later, we can serve the application with `$ ng serve`.

## Install InstantSearch.js

First of all, you need to add InstantSearch.js to your dependencies:

```sh
$ yarn add instantsearch.js
// OR
$ npm install instantsearch.js --save
```

After you have installed InstantSearch.js to your application's dependencies, we need to instantiate the InstantSearch.js library into an Angular service. So we will generate this new service:

```sh
$ ng generate service services/instantsearch
```

Open the new generated file `src/app/services/instantsearch.service.ts` and here initialize InstantSearch.js

In order to initialize InstantSearch.js, you need an Algolia account with a configured and non-empty index. For the sake of simplicity, let's use the credentials of our test index:

```javascript
import { Injectable } from '@angular/core';
import instantsearch from 'instantsearch.js/es';

@Injectable()
export class InstantSearchService {
  search = instantsearch({
    appId: 'latency',
    apiKey: '3d9875e51fbd20c7754e65422f7ce5e1',
    indexName: 'bestbuy',
    urlSync: true
  });

  constructor() {}
}
```

`appId`, `apiKey` and `indexName` are mandatory. Those values are credentials of your application in Algolia. They can be found in your [Algolia dashboard](https://www.algolia.com/api-keys).

You can see the code example above we are importing the ES6 module build of the InstantSearch.js library. This will reduce the final build size of your application a lot (this is known as [tree shaking](https://webpack.js.org/guides/tree-shaking/) in the JavaScript world).

Don't forget to register your service into the providers of your `src/app.modules.ts` file to be able to inject it into your next components. [(Official Angular documentation)](https://angular.io/tutorial/toh-pt4#inject-the-heroservice).

## Create a Hits component

In order to display results, we are going to use the [connectors](https://community.algolia.com/instantsearch.js/v2/connectors.html) API of InstantSearch.js and more specially the [connectHits](https://community.algolia.com/instantsearch.js/v2/connectors/connectHits.html) connector.

Start by creating a new component in your Angular application for the hits:

```sh
$ ng generate component components/hits --inline-style --inline-template
```

In your newly created component, let's inject the `InstantSearchService` we created before:

```javascript
import { Component, OnInit } from '@angular/core';

import { InstantSearchService } from '../../services/instantsearch.service';

@Component({
  selector: 'app-hits',
  template: `<p>It works!</p>`,
  styles: []
})
export class HitsComponent implements OnInit {
  constructor(private instantSearchService: InstantSearchService) {}
  ngOnInit() {}
}
```

Now we can access the InstantSearch service, therefore we can connect the Angular component to the search. In InstantSearch.js v2, this can be done using the connectors, and in this case, the connectHits.

At the initialization and each time there is a result update, the callback given to `connectHits` is called with the fresh results. Since we want to display the hits in our component, we plug the `connectHits` with `updateState`.

```javascript
import { Component, OnInit } from '@angular/core';
import { connectHits } from 'instantsearch.js/es/connectors';

import { InstantSearchService } from '../../services/instantsearch.service';

@Component({
  selector: 'app-hits',
  template: `<p>It works!</p>`,
  styles: []
})
export class HitsComponent implements OnInit {
  // Define how your component state will look like,
  // and initialize it with an empty hits array
  state: { hits: {}[] } = { hits: [] };

  constructor(private instantSearchService: InstantSearchService) {}

  ngOnInit() {
    // Create a widget which will call `this.updateState` whenever
    // something changes on the search state itself
    const widget = connectHits(this.updateState);

    // Register the Hits widget into the instantSearchService search instance.
    this.instantSearchService.search.addWidget(widget());
  }

  updateState = (state, isFirstRendering) => {
    // asynchronous update of the state
    // avoid `ExpressionChangedAfterItHasBeenCheckedError`
    if (isFirstRendering) {
      return Promise.resolve().then(() => {
        this.state = state;
      });
    }

    this.state = state;
  }
}
```

Now we have a component which is synced to search state. This state search is accessible in the template of the component.

To render hits results we will use an `ngFor` directive:

```javascript
template: `
  <div class="is-hits-root">
    <ul>
      <li *ngFor="let hit of state.hits">
        {{ hit.name }}
      </li>
    </ul>
  </div>
`
```

Now we should be ready to display the results on your page, this will be covered in the next section.

## Display your results

Wherever you need to display hits results you an use the `<app-hits></app-hits>` component that we created before.

In this section we will display the hits in the main app component, open `src/app/app.component.html` and add into the markup:

```html
<app-hits></app-hits>
```

It's normal that you don't see anything on your page this time, we didn't start the search yet!

You should start the search after all the widgets have been registered into your InstantSearch.js search instance (The InstantSearchService we created earlier).

The safe way to do that, is to use the [AfterViewInit](https://angular.io/api/core/AfterViewInit) component life-cycle hook.

Open your main app component `src/app/app.component.ts` and implement the `AfterViewInit` hook and start the `InstantSearchService` search instance:

```javascript
import { Component, AfterViewInit } from '@angular/core';

import { InstantSearchService } from './services/instantsearch.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  constructor(private instantSearchService: InstantSearchService) {}

  ngAfterViewInit() {
    this.instantSearchService.search.start();
  }
}
```

And voilà! You should now see in your app the default search results without query provided!

This is pretty cool, but it's not usable without a search box, let's build a search box in a similar way.

## Interact with a search box

Create a new component for the SearchBox:

```sh
$ ng generate component components/search-box --inline-template --inline-style
```

In your freshly create component, we need to inject the `InstantSearchService` and connect the state of the component to the search with the [connectSearchBox](https://community.algolia.com/instantsearch.js/v2/connectors/connectSearchBox.html) connector like we did for the Hits component:

```javascript
import { Component, OnInit } from '@angular/core';
import { connectSearchBox } from 'instantsearch.js/es/connectors';

import { InstantSearchService } from '../../services/instantsearch.service';

@Component({
  selector: 'app-search-box',
  template: `<p>It works</p>`,
  styles: []
})
export class SearchBoxComponent implements OnInit {
  // Define SearchBox initial state
  state: { query: string; refine: Function } = {
    query: '',
    refine() {}
  };

  constructor(private instantSearchService: InstantSearchService) {}

  ngOnInit() {
    const widget = connectSearchBox(this.updateState);
    this.instantSearchService.search.addWidget(widget());
  }

  updateState = (state, isFirstRendering) => {
    // asynchronous update of the state
    // avoid `ExpressionChangedAfterItHasBeenCheckedError`
    if (isFirstRendering) {
      return Promise.resolve(null).then(() => {
        this.state = state;
      });
    }

    this.state = state;
  }
}
```

We are still missing an input for the user to update the query of the search. We will use Angular data binding to update the query and call `this.state.refine()` function every time the input value changes:

```javascript
template: `
  <input
    type="text"
    [value]="state.query"
    (input)="handleChange($event.target.value)"
  />
`
```

Add a method `handleChange()` on your component class that will call `this.state.refine()`:

```javascript
handleChange(query) {
  this.state.refine(query)
}
```

Mount your search box component in your app and you are good to go!

## Refining even further

When you’re searching through data, not everything is easy to know about. That’s why we offer the RefinementList. Implementing a RefinementList is very similar to a SearchBox, but now we have to pass options to the widget.

So just like the other components, we will start with the bootstrapping command:

```sh
$ ng generate component components/refinement-list --inline-template --inline-style
```

In that component, we’ll import the connectRefinementList first like this:

```javascript
import { connectRefinementList } from 'instantsearch.js/es/connectors';
```

Once we have that we can setup the state shape and initialize our connector in `ngOnInit`

```javascript
ngOnInit() {
  // Create a widget which will call `this.updateState` whenever
  // something changes on the search state itself.
  const widget = connectRefinementList(this.updateState);

  // Register the Hits widget into the instantSearchService search instance.
  this.instantSearchService.search.addWidget(widget());
}
```

Our RefinementList has some required attributes though, namely the `attributeName`. This is the name of the attribute that’s used to display this facet.

In our example, we’ll filter by the values that `category` has in our objects. We can pass the options when you call the widget like this:


```javascript
ngOnInit() {
  const widget = connectRefinementList(this.updateState);
  this.instantSearchService.search.addWidget(widget({
    attributeName: 'category'
  }));
}
```

Next, we make a template and a function to handle the refinement when someone clicks on it. The `handleChange()` function is simple:

```javascript
handleChange(query) {
  this.state.refine(query);
}
```

Now we have all the information needed to build the markup of the component, we can fill in the template like this:

```javascript
template: `
  <div>
    <label
      *ngFor="let item of (state.items ? state.items.slice(0, 10) : [])"
      (click)="handleChange($event.target.value)"
    >
      <input
        type="checkbox"
        [value]="item.value"
        [checked]="item.isRefined"
      />
      <span>({{ item.count }})</span>
    </label>
  </div>
`
```

## Wrapping up

Congratulations, you now have a fully featured **InstantSearch** result page in your **Angular2+ application!**

We used a `Service` for the InstantSearch instance, and then connect to that instance with connectors for each widget.

This service is then started in the app initialisation and injected into every component needing it.

In each component for a widget, we initialise the connector on `ngOnInit` and use the component’s state to render a template, while we use the `refine` function to refine the search even more.
