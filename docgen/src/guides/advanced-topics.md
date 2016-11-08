---
title: Advanced Topics
layout: guide.pug
category: guide
navWeight: 0
---

## How to preselect values using Virtual Widgets

Let's say you want to have some facet values already selected but without displaying them to the user. What you could do
is to to use a connector that will render nothing, like a virtual widget. 

Here's an example using the Menu connector to display by default the results from the "Dining" category.

```javascript
const ConnectedMenu = connectMenu(() => {
    return null;
  });

<ConnectedMenu attributeName="category" defaultRefinement="Dining"/>
```

## How to configure Algolia Search Parameters

Sometimes you will need to configure some search parameters values
([see the complete list of possible values](https://www.algolia.com/doc/rest-api/search#full-text-search-parameters))
but using a `Virtual Widget` will not be possible. A typical use case for it will be when you want to setup the distinct
parameter for example. 

In that case, our [InstantSearch root component](/component/InstantSearch.html) has a `searchParameters` props that can be used to do so. This props takes an object
of SearchParameters values. 

Here's an example for setting the `HitsPerPage` value:

```jsx
<InstantSearch
    appId="appId"
    apiKey="apiKey"
    indexName="indexName"
    searchParameters={{hitsPerPage: 30}}
>
</InstantSearch>
```

## How to use manual values with Menu and List

By default Algolia provides automatically the facet values that are being displayed in a Menu or in a List. But sometimes
for one reason or another you might want to be able to provide manually those facet values.

To do that, you can use the appropriate connector and manually add your values.

Here's an example to force category values for a Menu.

```javascript
const ConnectedMenu = connectMenu(props => {
    const items = [];
    
    items.push(
      {label: 'Outdoor', value: 'Outdoor'},
      {label: 'Dining', value: 'Dining'},
      {label: 'Bathroom', value: 'Bathroom'},
    );
    
    return <div>{items.map(i =>
        <div key={i.value}>
          <a href={props.createURL(i.value)}
             onClick={() => props.refine(i.value)}>
            {i.label}</a>
        </div>
      )}</div>;
});

<ConnectedMenu attributeName="category"/>
```

## How to synchronize the url with the search

The InstantSearch component features a complete URL synchronization solution. Whenever a widget's state changes, the URL will be updated to reflect the new state of the search UI. This has two main benefits:

* the user can use the browser's back and forward buttons to navigate back and forth between the different states of the search.
* the user can bookmark, copy and share a custom search URL.

To activate this feature, you need to pass the `urlSync` props when instantiating the InstantSearch component.

Here's an example

```jsx
<InstantSearch
    appId="appId"
    apiKey="apiKey"
    indexName="indexName"
    urlSync
  >
</InstantSearch>
```

**Location Debouncing**
 
Since UI updates can happen in quick succession, for instance when the user types in a query, 
the new locations are debounced. The treshold prop controls how long the component should wait between 
state changes before pushing a new location instead of replacing the old one.


