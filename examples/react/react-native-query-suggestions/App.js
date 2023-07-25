import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  InstantSearch,
  Configure,
  Index,
  connectSearchBox,
  connectInfiniteHits,
  connectHits,
  connectRefinementList,
} from 'react-instantsearch-native';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  Keyboard,
  TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import Highlight from './Highlight';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
  },
  suggestionsContainer: {
    flex: 1,
  },
  algoliaLogo: {
    width: 40,
    height: 40,
    margin: 10,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  bestResults: {
    backgroundColor: 'lightgrey',
    height: 40,
    justifyContent: 'center',
    padding: 10,
  },
  searchBox: {
    color: 'black',
    height: 50,
    width: 300,
    alignSelf: 'center',
  },
  hitsContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  suggestions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  suggestionsIcon: {
    marginRight: 10,
  },
  hitsPicture: { width: 40, height: 40 },
  hitsText: {
    alignSelf: 'center',
    paddingLeft: 5,
    flex: 1,
    flexWrap: 'wrap',
  },
  hitsSeparator: {
    height: 1,
    backgroundColor: 'lightgrey',
    marginTop: 10,
    marginBottom: 10,
  },
  categoryTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTextIn: { fontStyle: 'italic' },
  categoryText: { color: '#cc8008' },
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySuggestions: false,
      isFirstKeystroke: true,
      searchState: {},
      query: '',
      category: null,
    };
    this.displaySuggestions = this.displaySuggestions.bind(this);
    this.removeSuggestions = this.removeSuggestions.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.firstKeystroke = this.firstKeystroke.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
  }

  firstKeystroke() {
    this.setState({ isFirstKeystroke: false });
  }

  displaySuggestions() {
    this.setState({ displaySuggestions: true });
  }

  removeSuggestions() {
    this.setState({ displaySuggestions: false, isFirstKeystroke: true });
  }

  setQuery(query, category) {
    const {
      query: _query,
      page: _page,
      ...searchState
    } = this.state.searchState;
    if (searchState.indices && searchState.indices.instant_search) {
      searchState.indices.instant_search.page = 0;
    }
    this.setState({
      query,
      searchState,
      category,
      displaySuggestions: false,
    });
  }

  clearFilter() {
    this.setState({
      category: null,
      query: '',
    });
  }

  onSearchStateChange(searchState) {
    this.setState({ searchState });
  }

  render() {
    const suggestions = this.state.displaySuggestions ? (
      <SuggestionsHits onPressItem={this.setQuery} />
    ) : null;

    const results = this.state.displaySuggestions ? (
      <ResultsHits removeSuggestions={this.removeSuggestions} />
    ) : (
      <ResultsInfiniteHits removeSuggestions={this.removeSuggestions} />
    );
    return (
      <View style={styles.container}>
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          onSearchStateChange={this.onSearchStateChange}
          searchState={this.state.searchState}
        >
          <ConnectedSearchBox
            displaySuggestions={this.displaySuggestions}
            firstKeystroke={this.firstKeystroke}
            isFirstKeystroke={this.state.isFirstKeystroke}
            defaultRefinement={this.state.query}
            clearFilter={this.clearFilter}
          />
          <Index indexName="instant_search_demo_query_suggestions">
            <Configure hitsPerPage={5} />
            {suggestions}
          </Index>
          <Index indexName="instant_search">
            <Configure hitsPerPage={15} />
            <VirtualRefinementList
              attribute="categories"
              defaultRefinement={
                this.state.category ? [this.state.category] : []
              }
            />
            <Text style={styles.bestResults}>
              Best results
              {this.state.category ? ` in ${this.state.category}` : null}
            </Text>
            <View style={styles.suggestionsContainer}>{results}</View>
          </Index>
        </InstantSearch>
      </View>
    );
  }
}

class SearchBox extends Component {
  render() {
    return (
      <View style={styles.searchBoxContainer}>
        <Image
          source={{
            uri: 'https://www.algolia.com/static_assets/images/press/downloads/algolia-mark-blue.png',
          }}
          style={styles.algoliaLogo}
        />
        <TextInput
          style={styles.searchBox}
          onChangeText={(text) => {
            if (text === '') {
              this.props.clearFilter();
            }
            this.props.refine(text);
          }}
          value={this.props.currentRefinement}
          placeholder={'Search a product...'}
          placeholderTextColor={'black'}
          clearButtonMode={'always'}
          underlineColorAndroid={'white'}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize={'none'}
          onFocus={this.props.displaySuggestions}
          onChange={() => {
            if (this.props.isFirstKeystroke) {
              this.props.displaySuggestions();
              this.props.firstKeystroke();
            }
          }}
        />
      </View>
    );
  }
}

const ConnectedSearchBox = connectSearchBox(SearchBox);

SearchBox.propTypes = {
  currentRefinement: PropTypes.string,
  displaySuggestions: PropTypes.func,
  firstKeystroke: PropTypes.func,
  refine: PropTypes.func,
  isFirstKeystroke: PropTypes.bool,
  clearFilter: PropTypes.func,
};

const HitsList = ({ hits, removeSuggestions, onEndReached }) => (
  <FlatList
    renderItem={({ item }) => (
      <View style={styles.hitsContainer}>
        <Image
          source={{
            uri: `https://res.cloudinary.com/hilnmyskv/image/fetch/h_300,q_100,f_auto/${item.image}`,
          }}
          style={styles.hitsPicture}
        />
        <Text style={styles.hitsText}>
          <Highlight
            attribute="name"
            hit={item}
            highlightProperty="_highlightResult"
          />
        </Text>
      </View>
    )}
    data={hits}
    keyExtractor={(item, index) => item.objectID + index}
    onEndReached={onEndReached}
    onScroll={() => {
      Keyboard.dismiss();
      removeSuggestions();
    }}
    ItemSeparatorComponent={() => <View style={hits.hitsSeparator} />}
  />
);

HitsList.propTypes = {
  hits: PropTypes.array,
  removeSuggestions: PropTypes.func,
  onEndReached: PropTypes.func,
};

const ResultsInfiniteHits = connectInfiniteHits(
  ({ hits, hasMore, refine, removeSuggestions }) => (
    <HitsList
      removeSuggestions={removeSuggestions}
      hits={hits}
      onEndReached={() => {
        if (hasMore) {
          refine();
        }
      }}
    />
  )
);

const ResultsHits = connectHits(({ hits, removeSuggestions }) => (
  <HitsList removeSuggestions={removeSuggestions} hits={hits} />
));

const SuggestionsHits = connectHits(({ hits, onPressItem }) => (
  <FlatList
    renderItem={({ item, index }) => {
      const category =
        index === 1
          ? item.instant_search.facets.exact_matches.categories[0].value
          : null;
      return (
        <Item
          index={index}
          category={category}
          item={item}
          onPressItem={onPressItem}
        />
      );
    }}
    keyExtractor={(item, index) => item.objectID + index}
    data={hits.reduce((acc, hit, index) => {
      if (index === 0) {
        acc.push(hit); // we duplicate first hit to allow a refinement under or not category
      }
      acc.push(hit);
      return acc;
    }, [])}
    keyboardShouldPersistTaps="always"
  />
));

const buildItemCategoryText = (categoryText) => (
  <View style={styles.categoryTextContainer}>
    <Text style={styles.categoryTextIn}> in</Text>
    <Text style={styles.categoryText}> {categoryText}</Text>
  </View>
);

const Item = ({ item, category, onPressItem, index }) => {
  let text = null;
  if (index === 0) {
    text = buildItemCategoryText('All our categories');
  }
  if (category) {
    text = buildItemCategoryText(category);
  }
  return (
    <TouchableHighlight
      onPress={() => {
        Keyboard.dismiss();
        onPressItem(item.query, category);
      }}
      underlayColor="white"
    >
      <View style={styles.suggestions}>
        <Icon
          size={13}
          name="search"
          color="#000"
          style={styles.suggestionsIcon}
        />
        <Highlight
          attribute="query"
          hit={item}
          highlightProperty="_highlightResult"
          inverted
        />
        {text}
      </View>
    </TouchableHighlight>
  );
};

Item.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  category: PropTypes.string,
  onPressItem: PropTypes.func,
};

const VirtualRefinementList = connectRefinementList(() => null);
