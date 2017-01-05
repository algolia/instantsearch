/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
/* eslint-disable import/no-unresolved */
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TextInput,
  Image,
} from 'react-native';
/* eslint-enable import/no-unresolved */
import {InstantSearch} from 'react-instantsearch/native';
import {connectSearchBox, connectInfiniteHits} from 'react-instantsearch/connectors';

const styles = StyleSheet.create({
  maincontainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default React.createClass({
  render() {
    return (
      <View style={styles.maincontainer}>
        <InstantSearch
          className="container-fluid"
          appId="latency"
          apiKey="6be0576ff61c053d5f9a3225e2a90f76"
          indexName="ikea"
        >
          <ConnectedSearchBox/>
          <ConnectedHits/>
        </InstantSearch>
      </View>
    );
  },
});

class SearchBox extends React.Component {
  render() {
    return <TextInput
      style={{height: 40, borderColor: 'gray', borderWidth: 1}}
      onChangeText={text => this.props.refine(text)}
      value={this.props.currentRefinement}
    />;
  }
}

SearchBox.propTypes = {
  refine: React.PropTypes.func.isRequired,
  currentRefinement: React.PropTypes.string,
};

const ConnectedSearchBox = connectSearchBox(SearchBox);

class Hits extends React.Component {
  onEndReached() {
    if (this.props.hasMore) {
      this.props.refine();
    }
  }

  render() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    const hits = this.props.hits.length > 0 ?
      <View >
        <ListView
          dataSource={ds.cloneWithRows(this.props.hits)}
          renderRow={this._renderRow}
          onEndReached={this.onEndReached.bind(this)}/>
      </View> : null;
    return hits;
  }

  _renderRow = hit =>
    <View style={styles.item}>
      <Image
        style={{height: 100, width: 100}}
        source={{uri: hit.image}}
      />
      <Text>
        {hit.name}
      </Text>
    </View>;
}

Hits.propTypes = {
  hits: React.PropTypes.array.isRequired,
  refine: React.PropTypes.func.isRequired,
  hasMore: React.PropTypes.bool.isRequired,
};

const ConnectedHits = connectInfiniteHits(Hits);
