import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import {
  connectSearchBox,
  connectInfiniteHits,
  connectHits,
} from 'react-instantsearch/connectors';
import { InstantSearch, Configure, Index } from 'react-instantsearch/native';
import Highlight from './Highlight';
import { omit } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';

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
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySuggestions: false,
      isFirstKeystroke: true,
      searchState: {},
      query: '',
    };
    this.displaySuggestions = this.displaySuggestions.bind(this);
    this.removeSuggestions = this.removeSuggestions.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.firstKeystroke = this.firstKeystroke.bind(this);
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

  setQuery(query) {
    const searchState = omit(this.state.searchState, ['query', 'page']);
    if (searchState.indices && searchState.indices.instant_search) {
      searchState.indices.instant_search.page = 0;
    }
    this.setState({
      query,
      searchState,
      displaySuggestions: false,
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
          appId="latency"
          apiKey="6be0576ff61c053d5f9a3225e2a90f76"
          indexName="instant_search"
          onSearchStateChange={this.onSearchStateChange}
          searchState={this.state.searchState}
          root={{
            Root: View,
            props: { flex: 1 },
          }}
        >
          <ConnectedSearchBox
            displaySuggestions={this.displaySuggestions}
            firstKeystroke={this.firstKeystroke}
            isFirstKeystroke={this.state.isFirstKeystroke}
            defaultRefinement={this.state.query}
          />
          <Index indexName="instantsearch_query_suggestions">
            <Configure hitsPerPage={5} />
            {suggestions}
          </Index>
          <Index
            indexName="instant_search"
            root={{
              Root: View,
              props: { flex: 1 },
            }}
          >
            <Configure hitsPerPage={15} />
            <Text style={styles.bestResults}>Best results</Text>
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
            uri:
              'https://d13yacurqjgara.cloudfront.net/users/1090953/avatars/small/3a0f064859092a0e82bedddcee24a4a8.png?148154278',
          }}
          style={styles.algoliaLogo}
        />
        <TextInput
          style={styles.searchBox}
          onChangeText={text => this.props.refine(text)}
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
};

const HitsList = ({ hits, removeSuggestions, onEndReached }) => (
  <FlatList
    renderItem={({ item }) => (
      <View style={styles.hitsContainer}>
        <Image
          source={{
            uri: `https://res.cloudinary.com/hilnmyskv/image/fetch/h_300,q_100,f_auto/${
              item.image
            }`,
          }}
          style={styles.hitsPicture}
        />
        <Text style={styles.hitsText}>
          <Highlight
            attributeName="name"
            hit={item}
            highlightProperty="_highlightResult"
          />
        </Text>
      </View>
    )}
    data={hits}
    keyExtractor={item => item.objectID}
    onEndReached={onEndReached}
    onScroll={removeSuggestions}
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
    renderItem={({ item }) => (
      <TouchableHighlight
        onPress={() => {
          Keyboard.dismiss();
          onPressItem(item.query);
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
            attributeName="query"
            hit={item}
            highlightProperty="_highlightResult"
            inverted
          />
        </View>
      </TouchableHighlight>
    )}
    keyExtractor={item => item.objectID}
    data={hits}
    keyboardShouldPersistTaps="always"
  />
));
