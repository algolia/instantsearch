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
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';
import RatingMenu from 'react-native-star-rating';

import Stats from './components/Stats';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flexGrow: 1,
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
          <ConnectedRating attribute="rating" />
          <Stats
            searchState={this.state.searchState}
            onSearchStateChange={this.props.onSearchStateChange}
          />
          <VirtualRefinementList attribute="type" />
          <VirtualMenu attribute="categories" />
          <VirtualRange attribute="price" />
          <VirtualSearchBox />
        </InstantSearch>
      </View>
    );
  }
}

Filters.propTypes = {
  searchState: PropTypes.object.isRequired,
  onSearchStateChange: PropTypes.func.isRequired,
};

export default Filters;

class Rating extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    count: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        count: PropTypes.number,
      })
    ),
    canRefine: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  buildItem({ max, lowerBound, count, isLastSelectableItem }) {
    const disabled = !count;
    const isCurrentMinLower = this.props.currentRefinement.min < lowerBound;
    const selected =
      (isLastSelectableItem && isCurrentMinLower) ||
      (!disabled &&
        lowerBound === this.props.currentRefinement.min &&
        max === this.props.currentRefinement.max);
    return { max, min: lowerBound, count, selected };
  }

  _renderRow = ({ item: { max, min, count, selected } }) => (
    <TouchableHighlight
      style={{ backgroundColor: selected ? '#162331' : 'white' }}
      onPress={() =>
        selected
          ? this.props.refine({ min: this.props.min, max: this.props.max })
          : this.props.refine({ min, max })
      }
    >
      <View
        pointerEvents="none"
        style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}
      >
        <RatingMenu
          disabled={true}
          maxStars={max}
          rating={min}
          starSize={30}
          starColor="#FBAE00"
          emptyStarColor={selected ? 'white' : 'gray'}
        />
        <Text style={{ color: selected ? 'white' : 'black' }}> and up! </Text>
        <Text style={{ color: selected ? 'white' : 'black' }}>({count})</Text>
      </View>
    </TouchableHighlight>
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

  render() {
    const { refine, min, max, count, createURL } = this.props;
    const items = [];
    for (let i = max; i >= min; i--) {
      const hasCount =
        count.filter((item) => Number(item.value) === i).length > 0;
      const lastSelectableItem = count.reduce(
        (acc, item) =>
          item.value < acc.value || (!acc.value && hasCount) ? item : acc,
        {}
      );
      const itemCount = count.reduce(
        (acc, item) => (item.value >= i && hasCount ? acc + item.count : acc),
        0
      );
      items.push(
        this.buildItem({
          lowerBound: i,
          max,
          refine,
          count: itemCount,
          createURL,
          isLastSelectableItem: i === Number(lastSelectableItem.value),
        })
      );
    }
    return (
      <View>
        <FlatList data={items} renderItem={this._renderRow} />
      </View>
    );
  }
}

const VirtualRefinementList = connectRefinementList(() => null);
const VirtualSearchBox = connectSearchBox(() => null);
const VirtualMenu = connectMenu(() => null);
const VirtualRange = connectRange(() => null);
const ConnectedRating = connectRange(Rating);
