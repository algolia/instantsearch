---
title: Advanced Topics
layout: guide.pug
category: guide
navWeight: -1
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

```jsx
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

It exists many ways to manipulate the browser history. Here are some you could use:
* Using [the browser history api](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
* Using a JavaScript history library
* Using [react-router](https://github.com/ReactTraining/react-router). 
See our [small demo app to have a full integration example](https://github.com/algolia/instantsearch.js/tree/v2/packages/react-instantsearch/examples/react-router). 

## React Native

`react-instantsearch` is made to be compatible with [react native](https://facebook.github.io/react-native/). 
To build your mobile application using both `react-instantsearch` and `react native` you will need to use the 
proper [`InstantSearch root component`](/component/InstantSearch.html) 
and take advantage of our [connectors API](/connector.html).

Instead of using the `dom namespace` when importing the `InstantSearch root component` you will have to use the `native
namespace`. 

Here's an example showing you how to build a `SearchBox` and an infinite scroll view: 

```jsx
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    TextInput,
    Image,
} from 'react-native';
import {InstantSearch} from 'react-instantsearch/native';
import {connectSearchBox, connectInfiniteHits} from 'react-instantsearch/connectors';


export default AwesomeProject = React.createClass({
    render: function () {
        return (
            <View style={styles.maincontainer}>
                <InstantSearch
                    className="container-fluid"
                    appId="appId"
                    apiKey="apiKey"
                    indexName="indexName"
                >
                    <View style={styles.maincontainer}>
                        <CustomSearchBox/>
                        <CustomHits/>
                    </View>
                </InstantSearch>
            </View>
        );
    },
});

class SearchBox extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => this.props.refine(text)}
                value={this.props.query}
            />
        );
    }
}

const CustomSearchBox = connectSearchBox(SearchBox);

const CustomHits = connectInfiniteHits(React.createClass({
    onEndReached: function () {
        if (this.props.hasMore) {
            this.props.refine();
        }
    },

    render: function () {
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        const hits = this.props.hits.length > 0 ?
            <View style={styles.maincontainer}>
                <ListView
                    style={styles.list}
                    dataSource={ds.cloneWithRows(this.props.hits)}
                    renderRow={this._renderRow}
                    onEndReached={this.onEndReached}/>
            </View> : null;
        return hits;
    },

    _renderRow: function (hit) {
        return (
            <View style={styles.item}>
                <Image
                    style={{height: 100, width: 100}}
                    source={{uri: hit.image}}
                />
                <Text>
                    {hit.name}
                </Text>
            </View> );
    },
}));


const styles = StyleSheet.create({
    maincontainer: {
        backgroundColor: 'white',
        flex: 1,
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: 'column',
    },
    list: {
        flex: 1,
        flexDirection: 'column',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
    }
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
```



