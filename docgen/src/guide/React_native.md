---
title: React native
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 35
---

`react-instantsearch` is compatible with [react-native](https://facebook.github.io/react-native/).

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

export default InfiniteSearch = () =>
  <View style={styles.maincontainer}>
    <InstantSearch
      className="container-fluid"
      appId="appId"
      apiKey="apiKey"
      indexName="indexName"
    >
      <SearchBox/>
      <Hits/>
    </InstantSearch>
  </View>;

const SearchBox = connectSearchBox(({currentRefinement, refine}) =>
  <TextInput
    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
    onChangeText={(text) => refine(text)}
    value={currentRefinement}
  />
);

const Hits = connectInfiniteHits(React.createClass({
  onEndReached: function () {
    if (this.props.hasMore) {
      this.props.refine();
    }
  },

  render: function () {
    const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    const hits = this.props.hits.length > 0 ?
      <View style={styles.maincontainer}>
        <ListView
        style={styles.list}
        dataSource={dataSource.cloneWithRows(this.props.hits)}
        renderRow={this._renderRow}
        onEndReached={this.onEndReached}/>
      </View> :
      null;

    return hits;
  },

  _renderRow: function (hit) {
    return (
      <View style={styles.item}>
        <Image
          style={{height: 100, width: 100}}
          source={{uri: hit.image}}
        />
        <Text>{hit.name}</Text>
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

AppRegistry.registerComponent('InfiniteSearch', () => InfiniteSearch);
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Conditional_display.html">← Conditional Display</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/Server-side_rendering.html">Server-side rendering →</a>
    </div>
</div>