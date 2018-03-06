---
title: React Native
layout: main.pug
category: gettingstarted
withHeadings: true
navScroll: true
---

## Welcome to React InstantSearch

Get your app running with React Native using React InstantSearch in 7 Easy Steps:

1. install `react-instantsearch` in your [React Native](https://facebook.github.io/react-native/)  project
2. bootstrap an app using the `<InstantSearch>` component
3. display infinite results from Algolia
4. add a search box
5. highlight the results that match the query
6. filter the results
7. display those filter in a modal

## Before we start
React InstantSearch is meant to be used with Algolia, therefore, you’ll need the credentials to an Algolia index. To make it easier for you to get started, here are the credentials to an already configured index:

* appId: latency
* searchKey: 3d9875e51fbd20c7754e65422f7ce5e1
* indexName: ikea

It contains sample data for an e-commerce website.

This guide also expects you to have a working [React Native](https://facebook.github.io/react-native/) project. If you need to setup a [React Native](https://facebook.github.io/react-native/) project, we suggest you use [create-react-native-app](https://github.com/react-community/create-react-native-app) which is the [easiest way to start building a new React Native application](https://facebook.github.io/react-native/docs/getting-started.html). You can get your React Native app running within a few seconds and see the results using the [iOS Expo client](https://itunes.apple.com/app/apple-store/id982107779?ct=www&mt=8) or the [Android Expo client](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www).

## Install react-instantsearch

React InstantSearch is available in the [npm](https://www.npmjs.com) registry. To install it:

```shell
yarn add react-instantsearch
```

Note: we use `yarn add` to install dependencies but React InstantSearch is also installable via `npm install --save react-instantsearch`.

## Add the `<InstantSearch>` component

[`<InstantSearch>`](widgets/<InstantSearch>.html) is the component that will connect to Algolia
and will synchronise all the widgets together.

It maintains the state of the search, does the queries, and provides the results to the widgets so that they can update themselves when needed.

```jsx
import React from 'react';
import { InstantSearch } from 'react-instantsearch/native';
import { StyleSheet, View, Text } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <InstantSearch
          appId="latency"
          apiKey="6be0576ff61c053d5f9a3225e2a90f76"
          indexName="ikea"
        >
          <Text>
            Congrats 🎉! Your application is now connected to Algolia!
          </Text>
        </InstantSearch>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
});
```

`appId`, `apiKey` and `indexName` are mandatory. Those props are the
credentials of your application in Algolia. They can be found in your [Algolia
dashboard](https://www.algolia.com/api-keys).

Congrats 🎉! Your application is now connected to Algolia.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

  - How to connect a part of a [React](https://facebook.github.io/react/) application to Algolia

  - How to configure your Algolia credentials

  > To get more *under the hood* information about the `<InstantSearch>` wrapper
  > component, [read our guide](guide/<InstantSearch>.html).
</div>

## Display infinite results

The core of a search experience is to display results. By default, React InstantSearch will do a query at the start of the page and will retrieve the most relevant hits. Because we are on mobile, it makes sense to create an infinite scroll experience.

We don't provide any widgets for React native yet, but you’ll still be able to build an amazing search experience using what we call [connectors](guide/Connectors.html).

Connectors are higher order components. They encapsulate the logic for a specific kind of widget and they provide a way to interact with the InstantSearch context.

**Check out our dedicated [connectors guide](guide/Connectors.html). to learn more about them**

To display results, we are going to use the [connectInfiniteHits](connectors/connectInfiniteHits.html) connector.
This connector will give you all the results returned by Algolia, and it will update when there are new results. It will also keep track of all the accumulated hits while the user is scrolling.

This connector gives you three interesting properties:

* `hits`, the records that match the search state
* `hasMore`, a boolean that indicates if there are more pages to load
* `refine`, the function to call when the end of the page is reached to load more results.

On the React Native side we are going to take advantage of the [FlatList](https://facebook.github.io/react-native/docs/flatlist.html) to render this infinite scroll. The FlatList component is available since the v0.43 of React Native. If you're using a previous version, you can use the [ListView](https://facebook.github.io/react-native/docs/listview.html) component instead.

Let’s create our own React Native Infinite Hits widget:

```jsx
// First, we need to add the connectInfiniteHits connector to our import
import { connectInfiniteHits } from 'react-instantsearch/connectors';
// We also need to import the FlatList and other React Native component
import { StyleSheet, View, FlatList, Image, Text } from 'react-native';


// [...]

const Hits = connectInfiniteHits(({ hits, hasMore, refine }) => {

  /* if there are still results, you can
  call the refine function to load more */
  const onEndReached = function() {
    if (hasMore) {
      refine();
    }
  };

  return (
    <FlatList
      data={hits}
      onEndReached={onEndReached}
      keyExtractor={(item, index) => item.objectID}
      renderItem={({ item }) => {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              style={{ height: 100, width: 100 }}
              source={{ uri: item.image }}
            />
            <View style={{ flex: 1 }}>
              <Text>
                {item.name}
              </Text>
              <Text>
                {item.type}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
});
```

We can then call this component in the render function of `<App>`:

```jsx
const App = () =>
  <InstantSearch
    appId="latency"
    apiKey="3d9875e51fbd20c7754e65422f7ce5e1"
    indexName="ikea"
  >
   <Hits/>
  </InstantSearch>
```

You should now be able to see the results and scroll to fetch more of them. Of course depending of the attributes available on your records you might want to change this template.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

  - how to display the results from Algolia

  - how to build an infinite scrolling experience
</div>

## Add a SearchBox

Now that we've added the results, we can start querying our index. To do this, we are gonna use the [connectSearchBox](connectors/connectSearchBox.html) connector.

This connector gives you two interesting properties:

* `currentRefinement`, the current query
* `refine`, the function to call when a new query is entered. It takes the new query as a parameter.

On the React Native side we are going to take advantage of the [TextInput](http://facebook.github.io/react-native/releases/0.45/docs/textinput.html#textinput) to render this search box.

```jsx
// We need to add the connectSearchBox to our import
import {
  connectInfiniteHits,
  connectSearchBox,
} from 'react-instantsearch/connectors';
// We need to add the TextInput to our import
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  TextInput,
} from 'react-native';

// [...]

const SearchBox = connectSearchBox(({ refine, currentRefinement }) => {

  const styles = {
    height: 60,
    borderWidth: 1,
    padding: 10,
    margin: 10,
    flex: 1,
  };

  return (
    <TextInput
      style={styles}
      onChangeText={text => refine(text)}
      value={currentRefinement}
      placeholder={'Search a product...'}
      clearButtonMode={'always'}
      spellCheck={false}
      autoCorrect={false}
      autoCapitalize={'none'}
    />
  );
});

```

Let’s add this new `<SearchBox>` component inside our `<InstantSearch>` component.

```jsx
const App = () =>
  <View style={styles.container}>
    <InstantSearch
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="ikea"
    >
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <SearchBox />
      </View>
      <Hits />
    </InstantSearch>
  </View>
```

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

  - how to add a SearchBox to make queries into the records
</div>

## Highlight your results

The search is now interactive but we don't see what matched in each of the products.

Good thing for us, Algolia computes the matching part.

For taking  advantage of this feature, we need to use the [connectHighlight](connectors/connectHighlight.html) connector. Let’s create a new `<Highlight>` component.

This connector gives you one interesting properties:

* `highlight`, a function that returns an array of parsed hits indicating if they are highlighted or not.

When using this component you will have to provide two properties:

* `attribute` attribute name from the record that you want to highlight.
* `hit` , the hit to highlight

```jsx
// We need to import the connectHighlight to our import
import {
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
} from 'react-instantsearch/connectors';

const Highlight = connectHighlight(
  ({ highlight, attribute, hit, highlightProperty }) => {
    const parsedHit = highlight({
      attribute,
      hit,
      highlightProperty: '_highlightResult',
    });
    const highlightedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted)
        return (
          <Text key={idx} style={{ backgroundColor: '#ffff99' }}>
            {part.value}
          </Text>
        );
      return part.value;
    });
    return <Text>{highlightedHit}</Text>;
  }
);
```

Let’s use this new `<Highlight>` component inside our hits rendering:

```jsx

// [...]

const Hits = connectInfiniteHits(({ hits, hasMore, refine }) => {

 // [...]

  return (
    <FlatList
      data={hits}
      onEndReached={onEndReached}
      keyExtractor={(item, index) => item.objectID}
      renderItem={({ item }) => {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              style={{ height: 100, width: 100 }}
              source={{ uri: item.image }}
            />
            <View style={{ flex: 1 }}>
              <Text>
                <Highlight attribute="name" hit={item} />
              </Text>
              <Text>
                <Highlight attribute="type" hit={item} />
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
});
```

Now the search displays the results and highlights the part of the hit attribute that matches the query. This pattern is very important in search, especially with Algolia, so that the user knows what's going on. This way the search experience becomes a dialogue between the user and the data.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

  - how to highlight the matched part of the results

  - the importance of highlighting in a text-based search
</div>

## Filter your results

While the SearchBox is the way to go when it comes to textual search, you may also want to provide filters based on the structure of the records.

Algolia provides a set of parameters for filtering by facets, numbers or even geolocation. React InstantSearch packages those into a set of widgets (only for web) and connectors.

Since the dataset used here is an e-commerce one, let's filter the products by categories using a the [connectRefinementList](connectors/connectRefinementList.html) connector.

This connector gives you two interesting properties:

* `items `, the list of refinements. Each item has a `isRefined` property indicating if they are selected or not.
* `refine`, the function to call when a new category is selected

On the React Native side we are going to take advantage of the [FlatList](https://facebook.github.io/react-native/docs/flatlist.html) and the [TouchableHighlight](http://facebook.github.io/react-native/releases/0.45/docs/touchablehighlight.html#touchablehighlight) component to render this refinement list.

```jsx
// We need to add the RefinementList to our import
import {
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
  connectRefinementList,
} from 'react-instantsearch/connectors';
// We need to add the TouchableHighlight to our import
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native';

// [...]

const RefinementList = connectRefinementList(({ refine, items }) =>
  <FlatList
    data={items}
    keyExtractor={(item, index) => item.objectID}
    ListHeaderComponent={() =>
      <Text style={{ marginTop: 20, height: 50, alignSelf: 'center' }}>
        Categories
      </Text>}
    renderItem={({ item }) => {
      return (
        <View style={{ height: 30 }}>
          <TouchableHighlight
            onPress={() => {
              refine(item.value);
            }}
          >
            <Text style={item.isRefined ? { fontWeight: 'bold' } : {}}>
              {item.label}
            </Text>
          </TouchableHighlight>
        </View>
      );
    }}
  />
);
```

Let’s add this new `<RefinementList>` component to our `<InstantSearch>` component.

```jsx
const App = () =>
  <View style={styles.container}>
    <InstantSearch
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="ikea"
    >
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <SearchBox />
      </View>
      <RefinementList attribute="category" />
      <Hits />
    </InstantSearch>
  </View>
```

The `attribute` props specifies the faceted attribute to use in this widget. This attribute should be declared as a facet in the index configuration as well.

The values displayed are computed by Algolia from the results.

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

  - there are components for all types of refinements

  - the RefinementList works with facets

  - facets are computed from the results
</div>

## Putting our filters in a Modal
We don't have that much space available on our mobile screen so we're going to extract this RefinementList and display it inside a [Modal](http://facebook.github.io/react-native/releases/0.45/docs/modal.html#modal).

When using the [Modal](http://facebook.github.io/react-native/releases/0.45/docs/modal.html#modal), components that are displayed inside it are mounted and unmounted depending if the [Modal](http://facebook.github.io/react-native/releases/0.45/docs/modal.html#modal) is visible or not. One thing to know about React InstantSearch is that a refinement is applied only if its corresponding widget is mounted. If a widget is unmounted then its state is removed from the search state as well.

To keep track of the refinements applied inside the [Modal](http://facebook.github.io/react-native/releases/0.45/docs/modal.html#modal) (or another screen if you have navigation), you will need to use another `<InstantSearch>` component and synchronise the search state between them.

 `<InstantSearch>` takes two interesting props:

* `onSearchStateChange`, a function that is called every time the search state change.
* `searchState`, the search state to apply.

We are going to leverage those two props to keep in sync our two `<InstantSearch>` components.

First, let’s create the Modal:

```jsx
//We need to import the Modal
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableHighlight,
  Modal,
} from 'react-native';

// [...]

class Categories extends React.Component {
  render() {
    return (
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType={'none'}
          transparent={false}
          visible={this.props.modalVisible}
        >
          <View style={{ marginTop: 22 }}>
            <InstantSearch
              appId="latency"
              apiKey="6be0576ff61c053d5f9a3225e2a90f76"
              indexName="ikea"
              onSearchStateChange={this.props.onSearchStateChange}
              searchState={this.props.searchState}
            >
              <RefinementList attribute="category" />
              <TouchableHighlight
                onPress={() => {
                  this.props.setModalVisible(!this.props.modalVisible);
                }}
              >
                <Text
                  style={{ marginTop: 20, height: 50, alignSelf: 'center' }}
                >
                  Close
                </Text>
              </TouchableHighlight>
            </InstantSearch>
          </View>
        </Modal>
      </View>
    );
  }
}
```

Second, let’s add our Modal to our first `<InstantSearch>` component:

```jsx
export default class App extends React.Component {
  constructor() {
    super();
    this.state = { modalVisible: false, searchState: {} };
    this.setModalVisible = this.setModalVisible.bind(this);
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
  }

  onSearchStateChange(searchState) {
    this.setState({ searchState });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    return (
      <View style={styles.container}>
        <InstantSearch
          appId="latency"
          apiKey="6be0576ff61c053d5f9a3225e2a90f76"
          indexName="ikea"
          onSearchStateChange={this.onSearchStateChange}
          searchState={this.state.searchState}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}
          >
            <SearchBox />
            <TouchableHighlight
              onPress={() => {
                this.setModalVisible(true);
              }}
            >
              <Text>Categories</Text>
            </TouchableHighlight>
          </View>
          <Hits />
          <Categories
            setModalVisible={this.setModalVisible}
            modalVisible={this.state.modalVisible}
            onSearchStateChange={this.onSearchStateChange}
            searchState={this.state.searchState}
          />
        </InstantSearch>
      </View>
    );
  }
}
```

If you try the application and select a category, you’ll see that when you close the [Modal](http://facebook.github.io/react-native/releases/0.45/docs/modal.html#modal), the refinement is not applied to the search. This is because for a refinement to be applied, it needs to **be present inside the search state** and have a **corresponding widget mounted**.

So indeed, we will need a RefinementList mounted on our first `<InstantSearch>`. Of course, we don’t want to render anything, we just want to apply the refinement.

Luckily we can leverage a concept that is called [Virtual Widgets](guide/Virtual_widgets.html). A [Virtual Widget](guide/Virtual_widgets.html) allows you to pre refine any widget without rendering anything.

Let’s create one for our RefinementList:

```jsx
const VirtualRefinementList = connectRefinementList(() => null);
```

Let’s add it to our first `<InstantSearch>`:

```jsx

// […]

<InstantSearch
  appId="latency"
  apiKey="6be0576ff61c053d5f9a3225e2a90f76"
  indexName="ikea"
  onSearchStateChange={this.onSearchStateChange}
  searchState={this.state.searchState}
>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    }}
  >
    <SearchBox />
    <TouchableHighlight
      onPress={() => {
        this.setModalVisible(true);
      }}
    >
      <Text>Categories</Text>
    </TouchableHighlight>
  </View>
  <Hits />
  <VirtualRefinementList attribute="category" />
  <Categories
    setModalVisible={this.setModalVisible}
    modalVisible={this.state.modalVisible}
    onSearchStateChange={this.onSearchStateChange}
    searchState={this.state.searchState}
  />
</InstantSearch>
```

🎉  Congrats, you can now filter your results by categories!

<div class="highlight-key-part">
  <div class="highlight-key-part__title">In this section we've seen:</div>

  - how to synchronise different `<InstantSearch>` components to share the same state.
  - how to apply a refinement across your whole application when using navigation element such as Modal, Drawer, Tabs…
</div>

## Next steps

At this point, you know the basics of React InstantSearch. Read the guide to know and do more with it.

<div class="guide-nav">
Next: <a href="guide/">Guide →</a>
</div>
