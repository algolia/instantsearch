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

## URL Routing

One thing that could be nice to have is whenever a widget's state changes, the URL would be updated to reflect the new state of the search UI. 
Doing so has two main benefits:

* the user can use the browser's back and forward buttons to navigate back and forth between the different states of the search.
* the user can bookmark, copy and share a custom search URL.

To be able to do that, you will need to provide three props to the [InstantSearch root component](/components/InstantSearch.html).

* onStateChange(nextState): this a function that is called every time the InstantSearch state is being updated. 
* state: an object that is the current state of InstantSearch
* createURL(state): this function is needed for every widgets that will render a link. It expects a string in return.
This function while provided to every widgets and connectors is only useful if you are in a browser context. 

Here's an example showing you how to use [react-router](https://github.com/ReactTraining/react-router) with react-instantsearch. 

```javascript
import React, {Component} from 'react';
import {
    InstantSearch
} from 'react-instantsearch/dom';
import {withRouter} from 'react-router';
import qs from 'qs';

class App extends Component {
   constructor (props) {
       super(props);
       // we initialize the state by parsing the url
       this.state = {state: {...qs.parse(this.props.router.location.query)}}; 
    }
    
    /*
    Push the new state to the react-router history. The threshold is there 
    to specify how long we should wait between state changes before pushing 
    a new location instead of replacing the old one. This is a very basic 
    implementation you might want to perform advanced behaviors like removing 
    empty values from the url or being able to keep others query params. 
    */
    onStateChange = (nextState) => {
        const THRESHOLD = 700;
        const newPush = Date.now();
        /*
        the current state is saved to be given as the 
        state props of InstantSearch root component
        */
        this.setState({lastPush: newPush, state: nextState});
        if (this.state.lastPush && newPush - this.state.lastPush  <= THRESHOLD) {
            this.props.router.replace(nextState ? `?${qs.stringify(nextState)}` : '');
        } else {
            this.props.router.push(nextState ? `?${qs.stringify(nextState)}` : '');
        }
    };
    
    /*
    This is the function that will be provided to every widgets and connectors. 
    It allows you to be able to create a link. 
    */
    createURL = (state) => {
        return `?${qs.stringify(state)}`; 
    };

    render() {
        return (
            <InstantSearch
                appId="appId"
                apiKey="apiKey"
                indexName="indexName"
                state={this.state.state}
                onStateChange={this.onStateChange.bind(this)}
                createURL={this.createURL.bind(this)}
            >
            </InstantSearch>
        );
    }
}

export default withRouter(App);
```

