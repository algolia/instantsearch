import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  InstantSearch,
  connectSearchBox,
  connectInfiniteHits,
  connectRefinementList,
  connectStats,
  connectMenu,
  connectSortBy,
  connectRange,
  connectCurrentRefinements,
} from 'react-instantsearch-native';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
  StatusBar,
  Button,
  Platform,
  Dimensions,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Actions } from 'react-native-router-flux';
import RatingMenu from 'react-native-star-rating';
import IosIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Highlight from './components/Highlight';
import Spinner from './components/Spinner';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
  },
  items: {
    ...Platform.select({
      ios: {
        height: height - 170,
      },
      android: { height: height - 165 },
    }),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 5,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  sortBy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  searchBoxContainer: {
    backgroundColor: '#162331',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    backgroundColor: 'white',
    height: 40,
    borderWidth: 1,
    padding: 10,
    margin: 10,
    flexGrow: 1,
    ...Platform.select({
      ios: {
        borderRadius: 5,
      },
      android: {},
    }),
  },
  itemContent: {
    paddingLeft: 15,
    display: 'flex',
    marginRight: 5,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  itemType: {
    fontSize: 13,
    fontWeight: '200',
    paddingBottom: 5,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  starRating: { alignSelf: 'flex-start' },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
class Home extends Component {
  static displayName = 'React Native example';
  constructor(props) {
    super(props);

    this.state = {
      searchState: this.props.searchState ? this.props.searchState : {},
    };
  }

  onSearchStateChange = (nextState) => {
    this.setState({ searchState: { ...this.state.searchState, ...nextState } });
  };

  render() {
    return (
      <View style={styles.maincontainer}>
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          searchState={this.state.searchState}
          onSearchStateChange={this.onSearchStateChange}
        >
          <StatusBar backgroundColor="blue" barStyle="light-content" />
          <ConnectedSearchBox />

          <View style={styles.options}>
            <ConnectedStats />
            <ConnectedSortBy
              items={[
                { value: 'instant_search', label: 'Featured' },
                { value: 'instant_search_price_desc', label: 'Price desc' },
                { value: 'instant_search_price_asc', label: 'Price asc' },
              ]}
              defaultRefinement={'instant_search'}
            />
            <Filters
              searchState={this.state.searchState}
              onSearchStateChange={this.onSearchStateChange}
            />
          </View>
          <ConnectedHits />
          <VirtualRefinementList attribute="type" />
          <VirtualRange attribute="price" />
          <VirtualMenu attribute="categories" />
          <VirtualRange attribute="rating" />
        </InstantSearch>
      </View>
    );
  }
}

Home.propTypes = {
  searchState: PropTypes.object,
};

export default Home;

class SearchBox extends Component {
  render() {
    return (
      <View style={styles.searchBoxContainer}>
        <Spinner left={60} />
        <TextInput
          style={styles.searchBox}
          onChangeText={(text) => this.props.refine(text)}
          value={this.props.currentRefinement}
          placeholder={'Search a product...'}
          clearButtonMode={'always'}
          underlineColorAndroid={'white'}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize={'none'}
        />
      </View>
    );
  }
}

SearchBox.propTypes = {
  refine: PropTypes.func.isRequired,
  currentRefinement: PropTypes.string,
};

const ConnectedSearchBox = connectSearchBox(SearchBox);

class Hits extends Component {
  onEndReached = () => {
    if (this.props.hasMore) {
      this.props.refine();
    }
  };

  render() {
    const hits =
      this.props.hits.length > 0 ? (
        <View style={styles.items}>
          <FlatList data={this.props.hits} renderItem={this._renderRow} />
        </View>
      ) : null;
    return hits;
  }

  _renderRow = ({ item: hit }) => (
    <View style={styles.item}>
      <Image style={{ height: 70, width: 70 }} source={{ uri: hit.image }} />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>
          <Highlight
            attribute="name"
            hit={hit}
            highlightProperty="_highlightResult"
          />
        </Text>
        <Text style={styles.itemType}>
          <Highlight
            attribute="type"
            hit={hit}
            highlightProperty="_highlightResult"
          />
        </Text>
        <Text style={styles.itemPrice}>${hit.price}</Text>
        <View style={styles.starRating}>
          <RatingMenu
            disabled={true}
            maxStars={5}
            rating={hit.rating}
            starSize={15}
            starColor="#FBAE00"
          />
        </View>
      </View>
    </View>
  );

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

Hits.propTypes = {
  hits: PropTypes.array.isRequired,
  refine: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

const ConnectedHits = connectInfiniteHits(Hits);
const ConnectedStats = connectStats(({ nbHits }) => (
  <Text style={{ paddingLeft: 8 }}>{nbHits} products found</Text>
));

const ConnectedSortBy = connectSortBy(
  ({ refine, items, currentRefinement }) => {
    const icon =
      Platform.OS === 'ios' ? (
        <IosIcon
          size={13}
          name="ios-arrow-down"
          color="#000"
          style={styles.sortByArrow}
        />
      ) : (
        <MaterialIcon
          size={20}
          name="arrow-drop-down"
          color="#000"
          style={styles.sortByArrow}
        />
      );
    return (
      <View style={styles.sortBy}>
        <ModalDropdown
          animated={false}
          defaultValue={
            items.find((item) => item.value === currentRefinement).label
          }
          onSelect={(index, value) =>
            refine(items.find((item) => item.label === value).value)
          }
          options={items.map((item) => item.label)}
          renderRow={(item) => {
            const itemValue = items.find((i) => i.label === item).value;
            return (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: itemValue === currentRefinement ? 'bold' : '200',
                  padding: 10,
                }}
              >
                {item}
              </Text>
            );
          }}
          dropdownStyle={{
            width: 200,
            height: 110,
          }}
          textStyle={{ fontSize: 15 }}
        />
        {icon}
      </View>
    );
  }
);

const Filters = connectCurrentRefinements(
  ({ items, searchState, onSearchStateChange }) => (
    <Button
      onPress={() =>
        /* eslint-disable new-cap */
        Actions.Filters({
          searchState,
          onSearchStateChange,
        })
      }
      /* eslint-enable new-cap */
      title={`Filters (${items.length})`}
      color="#162331"
    />
  )
);
const VirtualRange = connectRange(() => null);
const VirtualRefinementList = connectRefinementList(() => null);
const VirtualMenu = connectMenu(() => null);
