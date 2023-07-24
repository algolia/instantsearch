import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  InstantSearch,
  connectRefinementList,
  connectSearchBox,
  connectRange,
  connectMenu,
} from 'react-instantsearch-native';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Platform,
  TouchableHighlight,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import Highlight from './components/Highlight';
import Stats from './components/Stats';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    minHeight: 41,
    padding: 11,
  },
  itemRefined: {
    fontWeight: 'bold',
  },
  searchBoxContainer: {
    backgroundColor: '#162331',
  },
  searchBox: {
    backgroundColor: 'white',
    height: 40,
    borderWidth: 1,
    padding: 10,
    margin: 10,
    ...Platform.select({
      ios: {
        borderRadius: 5,
      },
      android: {},
    }),
  },
});

class Filters extends Component {
  static displayName = 'React Native example';
  constructor(props) {
    super(props);
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.state = {
      searchState: props.searchState,
    };
  }
  onSearchStateChange(nextState) {
    const searchState = { ...this.state.searchState, ...nextState };
    this.setState({ searchState });
    this.props.onSearchStateChange(searchState);
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          onSearchStateChange={this.onSearchStateChange}
          searchState={this.state.searchState}
        >
          <ConnectedRefinementList attribute="type" />
          <Stats
            searchState={this.state.searchState}
            onSearchStateChange={this.props.onSearchStateChange}
          />
          <VirtualSearchBox />
          <VirtualMenu attribute="categories" />
          <VirtualRange attribute="price" />
          <VirtualRange attribute="rating" />
        </InstantSearch>
      </View>
    );
  }
}

Filters.propTypes = {
  searchState: PropTypes.object,
  onSearchStateChange: PropTypes.func.isRequired,
};

export default Filters;

class RefinementList extends Component {
  constructor(props) {
    super(props);
    this.saveQuery = this.saveQuery.bind(this);
    this.state = {
      query: '',
    };
  }
  saveQuery(text) {
    this.setState({ query: text });
  }
  render() {
    const { items, searchForItems } = this.props;
    const facets =
      items.length > 0 ? (
        <FlatList data={items} renderItem={this._renderRow} />
      ) : null;
    return (
      <View style={styles.searchBoxContainer}>
        <TextInput
          style={styles.searchBox}
          onChangeText={(text) => {
            this.saveQuery(text);
            searchForItems(text);
          }}
          placeholder={'Search a type...'}
          value={this.state.query}
          clearButtonMode={'always'}
          underlineColorAndroid={'white'}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize={'none'}
        />
        {facets}
      </View>
    );
  }

  _renderRow = ({ item: refinement }) => {
    const icon = refinement.isRefined ? (
      <Icon name="check-square-o" color="#e29b0b" />
    ) : (
      <Icon name="square-o" color="#000" />
    );
    const label = this.props.isFromSearch ? (
      <Highlight
        attribute="label"
        hit={refinement}
        highlightProperty="_highlightResult"
      />
    ) : (
      refinement.label
    );
    return (
      <TouchableHighlight
        onPress={() => {
          this.saveQuery('');
          this.props.refine(refinement.value);
          Keyboard.dismiss();
        }}
      >
        <View style={styles.item}>
          <Text style={refinement.isRefined ? styles.itemRefined : {}}>
            {label}
          </Text>
          {icon}
        </View>
      </TouchableHighlight>
    );
  };

  _renderSeparator = (sectionID, rowID, adjacentRowHighlighted) => (
    <View
      key={`${sectionID}-${rowID}`}
      style={{
        height: adjacentRowHighlighted ? 4 : 1,
        backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
      }}
    />
  );
}

RefinementList.propTypes = {
  query: PropTypes.string,
  saveQuery: PropTypes.func,
  searchForItems: PropTypes.func,
  refine: PropTypes.func,
  items: PropTypes.array,
  isFromSearch: PropTypes.bool,
};

const ConnectedRefinementList = connectRefinementList(RefinementList);
const VirtualSearchBox = connectSearchBox(() => null);
const VirtualRange = connectRange(() => null);
const VirtualMenu = connectMenu(() => null);
